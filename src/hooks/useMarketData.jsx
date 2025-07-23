import { useState, useEffect } from 'react';
import marketDataService from '../services/marketDataService';

const useMarketData = (date, instrument) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        const result = marketDataService.getHistoricalData(date, instrument);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch market data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [date, instrument]);
  
  return { data, loading, error };
};

export default useMarketData;
