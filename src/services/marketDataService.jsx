import moment from 'moment';
import { fetchCoinApiData, fetchBinanceData, fetchCoinGeckoData } from './apiService';

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

// Real API calls with fallback to mock data
const marketDataService = {
  // Flag to toggle between real API data and mock data
  useRealData: true,
  
  getHistoricalData: async (date, instrument) => {
    if (!marketDataService.useRealData) {
      // Fallback to mock data
      const startDate = moment(date).subtract(45, 'days');
      const endDate = moment(date).add(45, 'days');
      return generateHistoricalData(startDate, endDate, instrument);
    }
    
    try {
      const startDate = moment(date).subtract(45, 'days').format('YYYY-MM-DD');
      const endDate = moment(date).add(45, 'days').format('YYYY-MM-DD');
      
      // Determine the right API to use based on instrument type
      const instrumentId = instrument?.id || instrument;
      let apiData = null;
      
      if (instrumentId.includes('BTC') || instrumentId.includes('ETH') || instrumentId.includes('SOL')) {
        // Try CoinAPI first
        if (import.meta.env.VITE_COINAPI_KEY) {
          apiData = await fetchCoinApiData(instrumentId, startDate, endDate);
        }
        
        // If CoinAPI fails or no key, try CoinGecko
        if (!apiData) {
          const coinId = instrumentId.toLowerCase().replace('-usd', '').replace('/', '');
          apiData = await fetchCoinGeckoData(coinId);
        }
      } else if (['AAPL', 'MSFT', 'GOOGL'].includes(instrumentId)) {
        // For stocks we use mock data for this demo
        apiData = generateHistoricalData(
          moment(startDate), 
          moment(endDate), 
          instrument
        );
      } else if (instrumentId.includes('USDT')) {
        // For Binance trading pairs
        const binanceSymbol = instrumentId.replace('-', '');
        const startTimestamp = moment(startDate).valueOf();
        const endTimestamp = moment(endDate).valueOf();
        apiData = await fetchBinanceData(binanceSymbol, startTimestamp, endTimestamp);
      } else {
        // Default to CoinGecko for all other crypto
        try {
          const coinId = instrumentId.toLowerCase().replace('-usd', '');
          apiData = await fetchCoinGeckoData(coinId);
        } catch {
          // Fallback to mock data if everything fails
          apiData = generateHistoricalData(
            moment(startDate), 
            moment(endDate), 
            instrument
          );
        }
      }
      
      return apiData || generateHistoricalData(moment(startDate), moment(endDate), instrument);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Fallback to mock data on error
      const startDate = moment(date).subtract(45, 'days');
      const endDate = moment(date).add(45, 'days');
      return generateHistoricalData(startDate, endDate, instrument);
    }
  },
  
  getDailyData: async (date, instrument) => {
    try {
      if (!marketDataService.useRealData) {
        // Fallback to mock data
        const data = generateHistoricalData(date, date, instrument);
        return data[moment(date).format('YYYY-MM-DD')];
      }
      
      // Get full data and extract just the day we need
      const startDate = moment(date).format('YYYY-MM-DD');
      const endDate = moment(date).format('YYYY-MM-DD');
      const dateKey = moment(date).format('YYYY-MM-DD');
      
      // Try to get the data from our API service
      const instrumentId = instrument?.id || instrument;
      let apiData = null;
      
      if (instrumentId.includes('BTC') || instrumentId.includes('ETH')) {
        if (import.meta.env.VITE_COINAPI_KEY) {
          apiData = await fetchCoinApiData(instrumentId, startDate, endDate);
        } else {
          const coinId = instrumentId.toLowerCase().replace('-usd', '').replace('/', '');
          apiData = await fetchCoinGeckoData(coinId, 'usd', 1);
        }
      }
      
      return (apiData && apiData[dateKey]) || 
        generateHistoricalData(date, date, instrument)[dateKey];
    } catch (error) {
      console.error('Error fetching daily data:', error);
      const data = generateHistoricalData(date, date, instrument);
      return data[moment(date).format('YYYY-MM-DD')];
    }
  },
  
  getWeeklyData: async (date, instrument) => {
    try {
      if (!marketDataService.useRealData) {
        // Fallback to mock data
        const startDate = moment(date).startOf('week');
        const endDate = moment(date).endOf('week');
        const dailyData = generateHistoricalData(startDate, endDate, instrument);
        return aggregateToWeekly(dailyData)[startDate.format('YYYY-MM-DD')];
      }
      
      // Get daily data for the week and aggregate it
      const startDate = moment(date).startOf('week').format('YYYY-MM-DD');
      const endDate = moment(date).endOf('week').format('YYYY-MM-DD');
      
      // Try to get the data from our API service
      const instrumentId = instrument?.id || instrument;
      let apiData = null;
      
      if (instrumentId.includes('BTC') || instrumentId.includes('ETH')) {
        if (import.meta.env.VITE_COINAPI_KEY) {
          apiData = await fetchCoinApiData(instrumentId, startDate, endDate);
        } else {
          const coinId = instrumentId.toLowerCase().replace('-usd', '').replace('/', '');
          apiData = await fetchCoinGeckoData(coinId, 'usd', 7);
        }
      }
      
      if (apiData) {
        return aggregateToWeekly(apiData)[moment(startDate).format('YYYY-MM-DD')];
      } else {
        const mockStartDate = moment(date).startOf('week');
        const mockEndDate = moment(date).endOf('week');
        const dailyData = generateHistoricalData(mockStartDate, mockEndDate, instrument);
        return aggregateToWeekly(dailyData)[mockStartDate.format('YYYY-MM-DD')];
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      const startDate = moment(date).startOf('week');
      const endDate = moment(date).endOf('week');
      const dailyData = generateHistoricalData(startDate, endDate, instrument);
      return aggregateToWeekly(dailyData)[startDate.format('YYYY-MM-DD')];
    }
  },
  
  getMonthlyData: async (date, instrument) => {
    try {
      if (!marketDataService.useRealData) {
        // Fallback to mock data
        const startDate = moment(date).startOf('month');
        const endDate = moment(date).endOf('month');
        const dailyData = generateHistoricalData(startDate, endDate, instrument);
        return aggregateToMonthly(dailyData)[startDate.format('YYYY-MM-DD')];
      }
      
      // Get daily data for the month and aggregate it
      const startDate = moment(date).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(date).endOf('month').format('YYYY-MM-DD');
      
      // Try to get the data from our API service
      const instrumentId = instrument?.id || instrument;
      let apiData = null;
      
      if (instrumentId.includes('BTC') || instrumentId.includes('ETH')) {
        if (import.meta.env.VITE_COINAPI_KEY) {
          apiData = await fetchCoinApiData(instrumentId, startDate, endDate);
        } else {
          const coinId = instrumentId.toLowerCase().replace('-usd', '').replace('/', '');
          apiData = await fetchCoinGeckoData(coinId, 'usd', 30);
        }
      }
      
      if (apiData) {
        return aggregateToMonthly(apiData)[moment(startDate).format('YYYY-MM-DD')];
      } else {
        const mockStartDate = moment(date).startOf('month');
        const mockEndDate = moment(date).endOf('month');
        const dailyData = generateHistoricalData(mockStartDate, mockEndDate, instrument);
        return aggregateToMonthly(dailyData)[mockStartDate.format('YYYY-MM-DD')];
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      const startDate = moment(date).startOf('month');
      const endDate = moment(date).endOf('month');
      const dailyData = generateHistoricalData(startDate, endDate, instrument);
      return aggregateToMonthly(dailyData)[startDate.format('YYYY-MM-DD')];
    }
  },
  
  // For dashboard display
  getDetailedDayData: async (date, instrument) => {
    try {
      // Get detailed data for a specific day including intraday data
      const dayData = await marketDataService.getDailyData(date, instrument);
      
      if (!dayData) {
        return null;
      }
      
      // For real API data, we might not have intraday data, so create it if needed
      const intraday = dayData.intraday || generateIntradayData(dayData.open, dayData.close, dayData.volatility);
      
      return {
        ...dayData,
        // Add more detailed analytics
        volatilityBreakdown: {
          morning: dayData.volatility * (0.8 + Math.random() * 0.4),
          midday: dayData.volatility * (0.7 + Math.random() * 0.6),
          afternoon: dayData.volatility * (0.9 + Math.random() * 0.2),
        },
        volumeByHour: intraday.map(h => ({ hour: h.hour, volume: h.volume })),
        intraday: intraday
      };
    } catch (error) {
      console.error('Error fetching detailed day data:', error);
      return null;
    }
  },
  
  // Get historical data from a start date to current date for charts
  getHistoricalChartData: async (startDate, instrument) => {
    try {
      if (!marketDataService.useRealData) {
        const endDate = moment();
        const dailyData = generateHistoricalData(startDate, endDate, instrument);
        return Object.values(dailyData);
      }
      
      const endDate = moment().format('YYYY-MM-DD');
      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
      
      // Try to get the data from our API service
      const instrumentId = instrument?.id || instrument;
      let apiData = null;
      
      if (instrumentId.includes('BTC') || instrumentId.includes('ETH')) {
        if (import.meta.env.VITE_COINAPI_KEY) {
          apiData = await fetchCoinApiData(instrumentId, formattedStartDate, endDate);
        } else {
          const coinId = instrumentId.toLowerCase().replace('-usd', '').replace('/', '');
          const days = moment().diff(moment(startDate), 'days');
          apiData = await fetchCoinGeckoData(coinId, 'usd', days);
        }
      }
      
      if (apiData) {
        return Object.values(apiData);
      } else {
        const mockEndDate = moment();
        const dailyData = generateHistoricalData(startDate, mockEndDate, instrument);
        return Object.values(dailyData);
      }
    } catch (error) {
      console.error('Error fetching historical chart data:', error);
      const endDate = moment();
      const dailyData = generateHistoricalData(startDate, endDate, instrument);
      return Object.values(dailyData);
    }
  },
  
  // Toggle between real API data and mock data
  toggleDataSource: (useReal = true) => {
    marketDataService.useRealData = useReal;
  }
};

export default marketDataService;
