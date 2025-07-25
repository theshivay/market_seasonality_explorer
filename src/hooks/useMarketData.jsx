import { useState, useEffect, useContext } from 'react';
import marketDataService from '../services/marketDataService';
import { AppContext } from '../context/AppContext';

const useMarketData = (date, instrument) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { useRealData } = useContext(AppContext);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching market data for ${instrument?.id || instrument} using ${useRealData ? 'real API' : 'mock'} data`);
        
        // Set the useRealData flag in the service
        marketDataService.useRealData = useRealData;
        // Try to get daily data for this date
        const result = await marketDataService.getDailyData(date, instrument);
        console.log("Result from getDailyData:", result);
        
        if (isMounted) {
          setData(result);
          setError(null);
          console.log(`Fetched ${Object.keys(result || {}).length} days of data`);
          
          // Detailed logging for data verification
          if (result) {
            const dates = Object.keys(result).sort();
            if (dates.length > 0) {
              console.log('Data date range:', {first: dates[0], last: dates[dates.length-1], total: dates.length});
              console.log('Sample data entry:', result[dates[0]]);
            } else {
              console.warn('No data entries available');
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in useMarketData:', err);
          setError(err.message || 'Failed to fetch market data');
          setData(null);
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
  }, [date, instrument, useRealData]); // Add useRealData as dependency
  
  return { data, loading, error };
};

export default useMarketData;
