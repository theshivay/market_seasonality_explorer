import moment from 'moment';

// Function to format a date in various formats
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Function to get array of dates for a month
export const getDatesInMonth = (year, month) => {
  const startOfMonth = moment().year(year).month(month).startOf('month');
  const endOfMonth = moment().year(year).month(month).endOf('month');
  
  const dates = [];
  let currentDate = startOfMonth.clone();
  
  while (currentDate <= endOfMonth) {
    dates.push(currentDate.clone());
    currentDate.add(1, 'day');
  }
  
  return dates;
};

// Function to get array of weeks for a month
export const getWeeksInMonth = (year, month) => {
  const startOfMonth = moment().year(year).month(month).startOf('month');
  const endOfMonth = moment().year(year).month(month).endOf('month');
  
  const weeks = [];
  let currentWeek = [];
  
  // Fill in the days from previous month to complete the first week
  const firstDay = startOfMonth.day(); // 0 is Sunday, 1 is Monday, etc.
  
  if (firstDay !== 0) { // If the month doesn't start on Sunday
    const prevMonth = startOfMonth.clone().subtract(1, 'month');
    const daysInPrevMonth = prevMonth.daysInMonth();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = prevMonth.clone().date(day);
      currentWeek.push(date);
    }
  }
  
  // Fill in the days of the current month
  let currentDate = startOfMonth.clone();
  
  while (currentDate <= endOfMonth) {
    if (currentDate.day() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(currentDate.clone());
    currentDate.add(1, 'day');
  }
  
  // Fill in days from the next month to complete the last week
  const lastDay = endOfMonth.day();
  
  if (lastDay !== 6) { // If the month doesn't end on Saturday
    const nextMonth = endOfMonth.clone().add(1, 'month');
    let day = 1;
    
    for (let i = lastDay + 1; i <= 6; i++) {
      const date = nextMonth.clone().date(day++);
      currentWeek.push(date);
    }
  }
  
  // Add the last week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
};

// Function to get day names for calendar header
export const getDayNames = (format = 'ddd') => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment().day(i).format(format));
  }
  return days;
};

// Function to get month names for dropdown/selector
export const getMonthNames = (format = 'MMMM') => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(moment().month(i).format(format));
  }
  return months;
};

// Function to calculate volatility level based on value
export const getVolatilityLevel = (volatility, thresholds) => {
  if (volatility < thresholds.low) {
    return 'low';
  } else if (volatility >= thresholds.high) {
    return 'high';
  } else {
    return 'medium';
  }
};

// Function to determine performance level based on change
export const getPerformanceLevel = (change, thresholds) => {
  if (change > thresholds.good) {
    return 'positive';
  } else if (change < thresholds.bad) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

// Function to generate PDF export
export const generatePDF = (elementId) => {
  // This would be implemented with a library like html2pdf or jsPDF
  console.log(`Generate PDF for element: ${elementId}`);
};

// Function to export data as CSV
export const exportAsCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  // Convert data to CSV format
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csvContent = [headers, ...rows].join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to calculate date ranges for different view modes
export const getDateRangeForView = (date, viewMode) => {
  const currentDate = moment(date);
  
  switch (viewMode) {
    case 'daily':
      return {
        start: currentDate.clone().startOf('day'),
        end: currentDate.clone().endOf('day')
      };
    case 'weekly':
      return {
        start: currentDate.clone().startOf('week'),
        end: currentDate.clone().endOf('week')
      };
    case 'monthly':
      return {
        start: currentDate.clone().startOf('month'),
        end: currentDate.clone().endOf('month')
      };
    default:
      return {
        start: currentDate.clone().startOf('day'),
        end: currentDate.clone().endOf('day')
      };
  }
};

// Function to check if a date is in a selected range
export const isDateInRange = (date, range) => {
  if (!range || !range[0] || !range[1]) return false;
  
  const checkDate = moment(date).startOf('day');
  const startDate = moment(range[0]).startOf('day');
  const endDate = moment(range[1]).startOf('day');
  
  return checkDate >= startDate && checkDate <= endDate;
};

// Function to check if a date is today
export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

// Function to get a color based on value and a color scale
export const getColorForValue = (value, min, max, colorScale) => {
  if (value <= min) return colorScale[0];
  if (value >= max) return colorScale[colorScale.length - 1];
  
  const range = max - min;
  const normalizedValue = (value - min) / range;
  const index = Math.floor(normalizedValue * (colorScale.length - 1));
  
  return colorScale[index];
};

// Function to format numbers with appropriate precision
export const formatNumber = (number, precision = 2) => {
  if (number === undefined || number === null) return '-';
  
  if (Math.abs(number) >= 1000000) {
    return `${(number / 1000000).toFixed(precision)}M`;
  } else if (Math.abs(number) >= 1000) {
    return `${(number / 1000).toFixed(precision)}K`;
  } else {
    return number.toFixed(precision);
  }
};

// Function to format percentage values
export const formatPercentage = (value, precision = 2) => {
  if (value === undefined || value === null) return '-';
  return `${value >= 0 ? '+' : ''}${value.toFixed(precision)}%`;
};

// Create a single object with all exports
const dateUtils = {
  formatDate,
  getDatesInMonth,
  getWeeksInMonth,
  getDayNames,
  getMonthNames,
  getVolatilityLevel,
  getPerformanceLevel,
  generatePDF,
  exportAsCSV,
  getDateRangeForView,
  isDateInRange,
  isToday,
  getColorForValue,
  formatNumber,
  formatPercentage
};

export default dateUtils;
