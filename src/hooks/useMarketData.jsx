import { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import marketDataService from '../services/marketDataService';
import { AppContext } from '../context/AppContext';

/**
 * Hook to access market data for a specific date and instrument
 * Uses OKX API integration to fetch real market data
 * Supports daily, weekly, and monthly data based on view mode
 */
const useMarketData = (date, instrument, viewMode = 'month') => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { useRealData } = useContext(AppContext);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Market data requested for ${instrument?.id || instrument}`);
        
        // Set the useRealData flag in the service to determine whether to use the OKX API
        marketDataService.toggleDataSource(useRealData);
        
        let result;
        // Fetch data based on view mode
        switch(viewMode) {
          case 'week':
            // For weekly view, get weekly data for all weeks in the current month
            const weeklyData = {};
            const startOfMonth = moment(date).startOf('month');
            const endOfMonth = moment(date).endOf('month');
            let currentWeek = moment(startOfMonth).startOf('week');
            
            while (currentWeek.isSameOrBefore(endOfMonth, 'week')) {
              const weekStart = currentWeek.format('YYYY-MM-DD');
              try {
                const weekData = await marketDataService.getWeeklyData(currentWeek, instrument);
                weeklyData[weekStart] = weekData;
              } catch (error) {
                console.warn(`Failed to fetch data for week ${weekStart}:`, error);
              }
              currentWeek.add(1, 'week');
            }
            
            result = weeklyData;
            break;
          case 'day':
            // For day view, still use daily data but only for that specific day
            result = await marketDataService.getDailyData(date, instrument);
            break;
          case 'month':
          default:
            // Fetch data from OKX API using marketDataService
            result = await marketDataService.getDailyData(date, instrument);
            break;
        }
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in useMarketData:', err);
          setError(err.message || 'Failed to fetch market data');
          setData({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [date, instrument, useRealData, viewMode]);
  
  return { data, loading, error };
};

export default useMarketData;
