import moment from 'moment';

// Format date in different formats
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return moment(date).format(format);
};

// Format number with commas
export const formatNumber = (num, precision = 0) => {
  if (num === null || num === undefined) return '-';
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
};

// Format percentage
export const formatPercentage = (num, precision = 2) => {
  if (num === null || num === undefined) return '-';
  return `${num >= 0 ? '+' : ''}${num.toFixed(precision)}%`;
};

// Get volatility level classification
export const getVolatilityLevel = (volatility, thresholds = { high: 2.0, low: 0.5 }) => {
  if (volatility === null || volatility === undefined) return 'normal';
  if (volatility >= thresholds.high) return 'high';
  if (volatility <= thresholds.low) return 'low';
  return 'normal';
};

// Get performance level classification
export const getPerformanceLevel = (percentChange, thresholds = { good: 1.0, bad: -1.0 }) => {
  if (percentChange === null || percentChange === undefined) return 'neutral';
  if (percentChange >= thresholds.good) return 'good';
  if (percentChange <= thresholds.bad) return 'bad';
  return 'neutral';
};

// Generate calendar days for a month view
export const getCalendarDaysForMonth = (month) => {
  const firstDay = moment(month).startOf('month');
  const lastDay = moment(month).endOf('month');
  const startDay = firstDay.clone().startOf('week');
  const endDay = lastDay.clone().endOf('week');
  
  const days = [];
  let currentDay = startDay.clone();
  
  while (currentDay.isSameOrBefore(endDay, 'day')) {
    days.push(currentDay.clone());
    currentDay.add(1, 'day');
  }
  
  return days;
};

// Generate calendar days for a week view
export const getCalendarDaysForWeek = (date) => {
  const startOfWeek = moment(date).startOf('week');
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.clone().add(i, 'day'));
  }
  
  return days;
};

// Get week numbers for the current month
export const getWeekNumbers = (month) => {
  const firstDay = moment(month).startOf('month');
  const lastDay = moment(month).endOf('month');
  
  const weeks = [];
  let currentWeek = firstDay.week();
  
  while (currentWeek <= lastDay.week()) {
    weeks.push(currentWeek);
    currentWeek++;
  }
  
  return weeks;
};

// Format a date range as string
export const formatDateRange = (start, end) => {
  if (start.isSame(end, 'day')) {
    return start.format('MMMM D, YYYY');
  }
  
  if (start.isSame(end, 'month') && start.isSame(end, 'year')) {
    return `${start.format('MMMM')} ${start.format('D')} - ${end.format('D')}, ${start.format('YYYY')}`;
  }
  
  if (start.isSame(end, 'year')) {
    return `${start.format('MMM D')} - ${end.format('MMM D')}, ${start.format('YYYY')}`;
  }
  
  return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
};

// Calculate date colors based on market data (volatility)
export const getVolatilityColor = (volatility, colorTheme = 'default') => {
  // Normalize volatility to a 0-1 scale
  // Assuming volatility ranges from 0-10 in our mock data
  const normalizedValue = Math.min(volatility / 10, 1);
  
  if (colorTheme === 'default') {
    // Green to Red scale
    if (normalizedValue < 0.3) return 'rgb(74, 222, 128)'; // Light green
    if (normalizedValue < 0.6) return 'rgb(250, 204, 21)'; // Yellow
    if (normalizedValue < 0.8) return 'rgb(251, 146, 60)'; // Orange
    return 'rgb(248, 113, 113)'; // Red
  }
  
  if (colorTheme === 'contrast') {
    // Higher contrast colors
    if (normalizedValue < 0.3) return 'rgb(22, 163, 74)'; // Dark green
    if (normalizedValue < 0.6) return 'rgb(202, 138, 4)'; // Dark yellow
    if (normalizedValue < 0.8) return 'rgb(234, 88, 12)'; // Dark orange
    return 'rgb(220, 38, 38)'; // Dark red
  }
  
  if (colorTheme === 'colorblind') {
    // Colorblind-friendly palette
    if (normalizedValue < 0.3) return 'rgb(0, 158, 115)'; // Teal
    if (normalizedValue < 0.6) return 'rgb(240, 228, 66)'; // Yellow
    if (normalizedValue < 0.8) return 'rgb(0, 114, 178)'; // Blue
    return 'rgb(213, 94, 0)'; // Vermilion
  }
  
  return 'rgb(209, 213, 219)'; // Default gray
};

// Calculate performance arrow direction and color
export const getPerformanceIndicator = (performance, colorTheme = 'default') => {
  if (performance > 0.5) {
    return {
      direction: 'up',
      color: colorTheme === 'colorblind' ? 'rgb(0, 158, 115)' : 'rgb(34, 197, 94)'
    };
  }
  
  if (performance < -0.5) {
    return {
      direction: 'down',
      color: colorTheme === 'colorblind' ? 'rgb(213, 94, 0)' : 'rgb(239, 68, 68)'
    };
  }
  
  return {
    direction: 'neutral',
    color: 'rgb(156, 163, 175)'
  };
};

// Format price with currency symbol and appropriate decimals
export const formatPrice = (price, instrument = null) => {
  if (price === null || price === undefined) return '-';
  
  // Determine currency symbol based on instrument type
  let symbol = '$';
  let precision = 2;
  
  if (instrument) {
    // If we have an instrument object with symbol or id property
    if (typeof instrument === 'object') {
      if ((instrument.symbol && (instrument.symbol.includes('BTC') || instrument.symbol.includes('ETH'))) ||
          (instrument.id && (instrument.id.includes('BTC') || instrument.id.includes('ETH')))) {
        precision = 4;
      } else if (instrument.symbol && instrument.symbol.includes('JPY')) {
        precision = 0;
        symbol = '¥';
      } else if (instrument.symbol && instrument.symbol.includes('EUR')) {
        symbol = '€';
      } else if (instrument.symbol && instrument.symbol.includes('GBP')) {
        symbol = '£';
      }
    }
    // Simple string currency check
    else if (typeof instrument === 'string') {
      if (instrument.includes('BTC') || instrument.includes('ETH')) {
        precision = 4;
      } else if (instrument.includes('JPY')) {
        precision = 0;
        symbol = '¥';
      } else if (instrument.includes('EUR')) {
        symbol = '€';
      } else if (instrument.includes('GBP')) {
        symbol = '£';
      }
    }
  }
  
  return `${symbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })}`;
};
