import moment from 'moment';

// Helper function to get random value between min and max
const getRandomValue = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Helper function to generate mock volatility (standard deviation)
const generateVolatility = (baseValue, day) => {
  // Different patterns for different days of week to simulate market behavior
  const dayOfWeek = moment(day).day();
  
  // Markets tend to be more volatile on Mondays and Fridays in this simulation
  let volatilityFactor = 1;
  if (dayOfWeek === 1) volatilityFactor = 1.2; // Monday
  if (dayOfWeek === 5) volatilityFactor = 1.3; // Friday
  
  return baseValue * volatilityFactor * (0.5 + Math.random());
};

// Helper to generate price movements
const generatePriceMovement = (basePrice, volatility) => {
  const movement = (Math.random() - 0.5) * volatility * 10;
  return basePrice * (1 + movement / 100); // Percentage change
};

// Generate historical data for a period
const generateHistoricalData = (startDate, endDate, instrument) => {
  const data = {};
  let currentDate = moment(startDate);
  const lastDate = moment(endDate);
  
  // Base values for different instruments
  const baseValues = {
    'BTC-USD': { price: 40000, volume: 5000, volatility: 3 },
    'ETH-USD': { price: 2000, volume: 10000, volatility: 4 },
    'SOL-USD': { price: 100, volume: 15000, volatility: 5 },
    'AAPL': { price: 180, volume: 20000, volatility: 1 },
    'MSFT': { price: 350, volume: 15000, volatility: 1.2 },
    'GOOGL': { price: 140, volume: 12000, volatility: 1.5 },
  };
  
  const baseValue = baseValues[instrument.id] || { price: 100, volume: 10000, volatility: 2 };
  let lastPrice = baseValue.price;
  
  // Generate data for each day
  while (currentDate.isSameOrBefore(lastDate, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const volatility = generateVolatility(baseValue.volatility, currentDate);
    
    // Opening price starts close to previous close
    const openPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.01);
    
    // High and low based on volatility
    const highLowRange = openPrice * (volatility / 100);
    const highPrice = openPrice + highLowRange * Math.random();
    const lowPrice = openPrice - highLowRange * Math.random();
    
    // Close price
    const closePrice = generatePriceMovement(openPrice, volatility);
    
    // Volume based on volatility and base volume
    const volume = baseValue.volume * (0.5 + Math.random() + volatility / 10);
    
    // Performance metrics
    const performance = ((closePrice - openPrice) / openPrice) * 100;
    
    // Technical indicators (simple moving averages)
    const sma5 = closePrice * (1 + (Math.random() - 0.5) * 0.01);
    const sma20 = closePrice * (1 + (Math.random() - 0.5) * 0.02);
    
    // RSI (Relative Strength Index) - simplified mock
    const rsi = 30 + Math.random() * 40;
    
    // Create entry
    data[dateStr] = {
      date: dateStr,
      instrument: instrument.id,
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      volume,
      volatility,
      performance,
      liquidity: volume / baseValue.volume, // Normalized liquidity
      technicalIndicators: {
        sma5,
        sma20,
        rsi
      },
      intraday: generateIntradayData(openPrice, closePrice, volatility)
    };
    
    // Set last price for next iteration
    lastPrice = closePrice;
    
    // Move to next day
    currentDate.add(1, 'day');
  }
  
  return data;
};

// Generate intraday data (hourly)
const generateIntradayData = (open, close, volatility) => {
  const data = [];
  const hoursInDay = 8; // Trading hours
  
  let currentPrice = open;
  const totalChange = close - open;
  const stepChange = totalChange / hoursInDay;
  
  for (let hour = 0; hour < hoursInDay; hour++) {
    const expectedPrice = open + stepChange * hour;
    // Add some random noise based on volatility
    const price = expectedPrice + (Math.random() - 0.5) * volatility * 2;
    
    data.push({
      hour,
      price,
      volume: 1000 + Math.random() * 5000
    });
    
    currentPrice = price;
  }
  
  return data;
};

// Generate weekly data by aggregating daily data
const aggregateToWeekly = (dailyData) => {
  const weeklyData = {};
  
  // Group by week
  Object.values(dailyData).forEach(day => {
    const weekStart = moment(day.date).startOf('week').format('YYYY-MM-DD');
    
    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = {
        weekStart,
        instrument: day.instrument,
        open: day.open, // First day's open
        high: day.high,
        low: day.low,
        close: day.close, // Will be overwritten by last day
        volume: day.volume,
        days: [day]
      };
    } else {
      const week = weeklyData[weekStart];
      week.high = Math.max(week.high, day.high);
      week.low = Math.min(week.low, day.low);
      week.close = day.close; // Last day's close
      week.volume += day.volume;
      week.days.push(day);
    }
  });
  
  // Calculate aggregated metrics
  Object.values(weeklyData).forEach(week => {
    // Average volatility
    week.volatility = week.days.reduce((sum, day) => sum + day.volatility, 0) / week.days.length;
    
    // Performance
    week.performance = ((week.close - week.open) / week.open) * 100;
    
    // Average liquidity
    week.liquidity = week.days.reduce((sum, day) => sum + day.liquidity, 0) / week.days.length;
  });
  
  return weeklyData;
};

// Generate monthly data by aggregating daily data
const aggregateToMonthly = (dailyData) => {
  const monthlyData = {};
  
  // Group by month
  Object.values(dailyData).forEach(day => {
    const monthStart = moment(day.date).startOf('month').format('YYYY-MM-DD');
    
    if (!monthlyData[monthStart]) {
      monthlyData[monthStart] = {
        monthStart,
        instrument: day.instrument,
        open: day.open, // First day's open
        high: day.high,
        low: day.low,
        close: day.close, // Will be overwritten by last day
        volume: day.volume,
        days: [day]
      };
    } else {
      const month = monthlyData[monthStart];
      month.high = Math.max(month.high, day.high);
      month.low = Math.min(month.low, day.low);
      month.close = day.close; // Last day's close
      month.volume += day.volume;
      month.days.push(day);
    }
  });
  
  // Calculate aggregated metrics
  Object.values(monthlyData).forEach(month => {
    // Average volatility
    month.volatility = month.days.reduce((sum, day) => sum + day.volatility, 0) / month.days.length;
    
    // Performance
    month.performance = ((month.close - month.open) / month.open) * 100;
    
    // Average liquidity
    month.liquidity = month.days.reduce((sum, day) => sum + day.liquidity, 0) / month.days.length;
    
    // Weekly breakdown
    month.weeks = aggregateToWeekly(
      month.days.reduce((acc, day) => {
        acc[day.date] = day;
        return acc;
      }, {})
    );
  });
  
  return monthlyData;
};

// In a real application, these would be API calls
const marketDataService = {
  getHistoricalData: (date, instrument) => {
    // For demo purposes, generate 90 days of data centered on the given date
    const startDate = moment(date).subtract(45, 'days');
    const endDate = moment(date).add(45, 'days');
    return generateHistoricalData(startDate, endDate, instrument);
  },
  
  getDailyData: (date, instrument) => {
    // Generate a single day's data
    const data = generateHistoricalData(date, date, instrument);
    return data[moment(date).format('YYYY-MM-DD')];
  },
  
  getWeeklyData: (date, instrument) => {
    // Generate a week of data
    const startDate = moment(date).startOf('week');
    const endDate = moment(date).endOf('week');
    const dailyData = generateHistoricalData(startDate, endDate, instrument);
    return aggregateToWeekly(dailyData)[startDate.format('YYYY-MM-DD')];
  },
  
  getMonthlyData: (date, instrument) => {
    // Generate a month of data
    const startDate = moment(date).startOf('month');
    const endDate = moment(date).endOf('month');
    const dailyData = generateHistoricalData(startDate, endDate, instrument);
    return aggregateToMonthly(dailyData)[startDate.format('YYYY-MM-DD')];
  },
  
  // For dashboard display
  getDetailedDayData: (date, instrument) => {
    // Get detailed data for a specific day including intraday data
    const dayData = marketDataService.getDailyData(date, instrument);
    return {
      ...dayData,
      // Add more detailed analytics
      volatilityBreakdown: {
        morning: dayData.volatility * (0.8 + Math.random() * 0.4),
        midday: dayData.volatility * (0.7 + Math.random() * 0.6),
        afternoon: dayData.volatility * (0.9 + Math.random() * 0.2),
      },
      volumeByHour: dayData.intraday.map(h => ({ hour: h.hour, volume: h.volume })),
    };
  },
  
  // Get historical data from a start date to current date for charts
  getHistoricalChartData: (startDate, instrument) => {
    const endDate = moment();
    const dailyData = generateHistoricalData(startDate, endDate, instrument);
    
    // Convert the object to an array for easier charting
    return Object.values(dailyData);
  }
};

export default marketDataService;
