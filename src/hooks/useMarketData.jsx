import { useState, useEffect } from 'react';
import marketDataService from '../services/marketDataService';

const useMarketData = (date, instrument, useRealData = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pass the useRealData parameter to determine data source
        const result = await marketDataService.getHistoricalData(date, instrument, useRealData);
        
        if (isMounted) {
          setData(result);
          setError(null);
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
  }, [date, instrument]);
  
  return { data, loading, error };
};

export default useMarketData;
