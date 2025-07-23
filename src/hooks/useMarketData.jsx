import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  fetchHistoricalData,
  fetchOrderbook,
  calculateVolatility,
  calculateLiquidity,
  calculatePerformance
} from '../services/marketDataService.jsx';

// Custom hook for fetching and processing market data
const useMarketData = (symbol, timeframe, startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine the appropriate interval based on timeframe
  const getInterval = useCallback(() => {
    switch (timeframe) {
      case 'daily':
        return '1h'; // For daily view, get hourly data
      case 'weekly':
        return '1d'; // For weekly view, get daily data
      case 'monthly':
        return '1d'; // For monthly view, get daily data
      default:
        return '1d';
    }
  }, [timeframe]);

  // Group data by hour (for daily view)
  const groupDataByHour = useCallback((data, start, end) => {
    // Create 24 hourly buckets for the day
    const startMoment = moment(start).startOf('day');
    // We don't need endMoment but include it for clarity
    // eslint-disable-next-line no-unused-vars
    const endMoment = moment(end).endOf('day');
    const result = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = startMoment.clone().add(hour, 'hours');
      const hourEnd = hourStart.clone().add(59, 'minutes').add(59, 'seconds');
      
      // Filter data for this hour
      const hourData = data.filter(item => {
        const itemTime = moment(item.time);
        return itemTime >= hourStart && itemTime <= hourEnd;
      });

      if (hourData.length > 0) {
        // Calculate metrics for this hour
        const hourVolatility = calculateVolatility(hourData);
        const hourPerformance = calculatePerformance(hourData);
        
        result.push({
          time: hourStart.valueOf(),
          formattedTime: hourStart.format('HH:mm'),
          open: hourData[0].open,
          high: Math.max(...hourData.map(d => d.high)),
          low: Math.min(...hourData.map(d => d.low)),
          close: hourData[hourData.length - 1].close,
          volume: hourData.reduce((sum, item) => sum + item.volume, 0),
          numberOfTrades: hourData.reduce((sum, item) => sum + item.numberOfTrades, 0),
          volatility: hourVolatility ? hourVolatility.daily : null,
          performance: hourPerformance ? hourPerformance.priceChangePercentage : null
        });
      } else {
        // No data for this hour
        result.push({
          time: hourStart.valueOf(),
          formattedTime: hourStart.format('HH:mm'),
          open: null,
          high: null,
          low: null,
          close: null,
          volume: 0,
          numberOfTrades: 0,
          volatility: null,
          performance: null
        });
      }
    }
    
    return result;
  }, []);

  // Group data by day (for weekly view)
  const groupDataByDay = useCallback((data, start, end) => {
    const startMoment = moment(start).startOf('day');
    const endMoment = moment(end).endOf('day');
    const days = endMoment.diff(startMoment, 'days') + 1;
    const result = [];

    for (let day = 0; day < days; day++) {
      const dayStart = startMoment.clone().add(day, 'days');
      const dayEnd = dayStart.clone().endOf('day');
      
      // Filter data for this day
      const dayData = data.filter(item => {
        const itemTime = moment(item.time);
        return itemTime >= dayStart && itemTime <= dayEnd;
      });

      if (dayData.length > 0) {
        // Calculate metrics for this day
        const dayVolatility = calculateVolatility(dayData);
        const dayPerformance = calculatePerformance(dayData);
        
        result.push({
          time: dayStart.valueOf(),
          formattedTime: dayStart.format('MMM D'),
          date: dayStart.toDate(),
          open: dayData[0].open,
          high: Math.max(...dayData.map(d => d.high)),
          low: Math.min(...dayData.map(d => d.low)),
          close: dayData[dayData.length - 1].close,
          volume: dayData.reduce((sum, item) => sum + item.volume, 0),
          numberOfTrades: dayData.reduce((sum, item) => sum + item.numberOfTrades, 0),
          volatility: dayVolatility ? dayVolatility.daily : null,
          performance: dayPerformance ? dayPerformance.priceChangePercentage : null
        });
      } else {
        // No data for this day
        result.push({
          time: dayStart.valueOf(),
          formattedTime: dayStart.format('MMM D'),
          date: dayStart.toDate(),
          open: null,
          high: null,
          low: null,
          close: null,
          volume: 0,
          numberOfTrades: 0,
          volatility: null,
          performance: null
        });
      }
    }
    
    return result;
  }, []);

  // Group data by week (for monthly view)
  const groupDataByWeek = useCallback((data, start, end) => {
    const startMoment = moment(start).startOf('week');
    const endMoment = moment(end).endOf('week');
    const weeks = Math.ceil(endMoment.diff(startMoment, 'days') / 7);
    const result = [];

    for (let week = 0; week < weeks; week++) {
      const weekStart = startMoment.clone().add(week, 'weeks');
      const weekEnd = weekStart.clone().endOf('week');
      
      // Filter data for this week
      const weekData = data.filter(item => {
        const itemTime = moment(item.time);
        return itemTime >= weekStart && itemTime <= weekEnd;
      });

      if (weekData.length > 0) {
        // Calculate metrics for this week
        const weekVolatility = calculateVolatility(weekData);
        const weekPerformance = calculatePerformance(weekData);
        
        result.push({
          time: weekStart.valueOf(),
          formattedTime: `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D')}`,
          weekStart: weekStart.toDate(),
          weekEnd: weekEnd.toDate(),
          open: weekData[0].open,
          high: Math.max(...weekData.map(d => d.high)),
          low: Math.min(...weekData.map(d => d.low)),
          close: weekData[weekData.length - 1].close,
          volume: weekData.reduce((sum, item) => sum + item.volume, 0),
          numberOfTrades: weekData.reduce((sum, item) => sum + item.numberOfTrades, 0),
          volatility: weekVolatility ? weekVolatility.daily : null,
          performance: weekPerformance ? weekPerformance.priceChangePercentage : null
        });
      } else {
        // No data for this week
        result.push({
          time: weekStart.valueOf(),
          formattedTime: `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D')}`,
          weekStart: weekStart.toDate(),
          weekEnd: weekEnd.toDate(),
          open: null,
          high: null,
          low: null,
          close: null,
          volume: 0,
          numberOfTrades: 0,
          volatility: null,
          performance: null
        });
      }
    }
    
    return result;
  }, []);

  // Process data according to the selected timeframe
  const processDataByTimeframe = useCallback((data, timeframe, start, end) => {
    if (!data || data.length === 0) return [];

    switch (timeframe) {
      case 'daily':
        // For daily view, group by hour
        return groupDataByHour(data, start, end);
      case 'weekly':
        // For weekly view, group by day
        return groupDataByDay(data, start, end);
      case 'monthly':
        // For monthly view, group by day or week depending on the data size
        return data.length > 31
          ? groupDataByWeek(data, start, end)
          : groupDataByDay(data, start, end);
      default:
        return data;
    }
  }, [groupDataByHour, groupDataByDay, groupDataByWeek]);

  // Fetch data when parameters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      if (!symbol) return;

      setLoading(true);
      setError(null);
      
      // Add a slight delay to prevent too many concurrent API calls
      // which could lead to rate limiting
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      await delay(Math.random() * 200); // Random delay up to 200ms

      try {
        // Convert dates to timestamps for API
        const start = moment(startDate).valueOf();
        const end = moment(endDate).valueOf();
        const interval = getInterval();

        // Fetch historical price data
        const historicalData = await fetchHistoricalData(
          symbol,
          interval,
          start,
          end
        );
        
        if (!isMounted) return;

        // Fetch latest orderbook data
        const orderbookData = await fetchOrderbook(symbol);
        
        if (!isMounted) return;

        // Check if we have valid data
        if (!historicalData || historicalData.length === 0) {
          throw new Error('No historical data available for the selected period');
        }

        // Calculate metrics
        const volatility = calculateVolatility(historicalData);
        const liquidity = calculateLiquidity(orderbookData);
        const performance = calculatePerformance(historicalData);

        // Process data based on timeframe for visualization
        const processedData = processDataByTimeframe(
          historicalData,
          timeframe,
          startDate,
          endDate
        );
        
        if (!isMounted) return;

        // Check if the data has the isMockData flag
        const isMockData = historicalData[0]?.isMockData || orderbookData?.isMockData;
        
        // Combine all data
        setData({
          symbol,
          timeframe,
          historical: historicalData,
          processed: processedData,
          orderbook: orderbookData,
          metrics: {
            volatility,
            liquidity,
            performance
          },
          isMockData // Flag indicating if we're using mock data
        });
      } catch (err) {
        if (isMounted) {
          console.error('Error in useMarketData hook:', err);
          setError(err.message || 'Failed to fetch market data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [symbol, timeframe, startDate, endDate, getInterval, processDataByTimeframe]);

  return { data, loading, error };
};

export default useMarketData;
