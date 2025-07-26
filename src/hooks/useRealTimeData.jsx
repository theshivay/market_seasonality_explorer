import { useState, useEffect, useRef, useCallback } from 'react';
import websocketService from '../services/websocketService';

/**
 * Hook for real-time orderbook data
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT', 'BTC-USD')
 * @param {string} exchange - Exchange to connect to ('binance', 'coinbase', 'okx')
 * @param {boolean} enabled - Whether to enable real-time updates
 */
export const useOrderbook = (symbol, exchange = 'binance', enabled = true) => {
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: [],
    symbol: symbol,
    exchange: exchange,
    timestamp: null,
    loading: true,
    error: null
  });

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!enabled || !symbol) {
      return;
    }

    setOrderbook(prev => ({ ...prev, loading: true, error: null }));

    const handleOrderbookUpdate = (data) => {
      setOrderbook({
        bids: data.bids || [],
        asks: data.asks || [],
        symbol: data.symbol,
        exchange: data.exchange,
        timestamp: data.timestamp,
        loading: false,
        error: null
      });
    };

    const handleError = (error) => {
      setOrderbook(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to connect to real-time data'
      }));
    };

    try {
      unsubscribeRef.current = websocketService.subscribeToOrderbook(
        symbol,
        handleOrderbookUpdate,
        exchange
      );

            // Set timeout to handle connection issues (reduced timeout)
      const timeoutId = setTimeout(() => {
        setTickers(prev => {
          const newTickers = { ...prev };
          symbols.forEach(symbol => {
            if (newTickers[symbol]?.loading) {
              console.log(`⏰ Multi-ticker connection timeout for ${symbol}, switching to demo mode`);
              newTickers[symbol] = {
                ...newTickers[symbol],
                loading: false,
                error: 'Connection timeout - using demo data'
              };
            }
          });
          return newTickers;
        });
      }, 5000); // Reduced to 5 seconds

      return () => {
        clearTimeout(timeoutId);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } catch (error) {
      handleError(error);
    }
  }, [symbol, exchange, enabled]);

  return orderbook;
};

/**
 * Hook for real-time price ticker data
 * @param {string} symbol - Trading pair symbol
 * @param {string} exchange - Exchange to connect to
 * @param {boolean} enabled - Whether to enable real-time updates
 */
export const useTicker = (symbol, exchange = 'binance', enabled = true) => {
  const [ticker, setTicker] = useState({
    symbol: symbol,
    price: 0,
    change24h: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    exchange: exchange,
    timestamp: null,
    loading: true,
    error: null
  });

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!enabled || !symbol) {
      return;
    }

    setTicker(prev => ({ ...prev, loading: true, error: null }));

    const handleTickerUpdate = (data) => {
      setTicker({
        symbol: data.symbol,
        price: data.price,
        change24h: data.change24h,
        volume24h: data.volume24h,
        high24h: data.high24h,
        low24h: data.low24h,
        exchange: data.exchange,
        timestamp: data.timestamp,
        loading: false,
        error: null
      });
    };

    const handleError = (error) => {
      setTicker(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to connect to real-time data'
      }));
    };

    try {
      unsubscribeRef.current = websocketService.subscribeToTicker(
        symbol,
        handleTickerUpdate,
        exchange
      );

      // Set a timeout to handle connection issues (reduced timeout)
      const timeoutId = setTimeout(() => {
        setTicker(prev => {
          if (prev.loading) {
            console.log(`⏰ Ticker connection timeout for ${symbol}, switching to demo mode`);
            return {
              ...prev,
              loading: false,
              error: 'Connection timeout - using demo data'
            };
          }
          return prev;
        });
      }, 5000); // Reduced to 5 seconds

      return () => {
        clearTimeout(timeoutId);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } catch (error) {
      handleError(error);
    }
  }, [symbol, exchange, enabled]);

  return ticker;
};

/**
 * Hook for managing multiple real-time data streams
 * @param {Array} symbols - Array of trading pairs to monitor
 * @param {string} exchange - Exchange to connect to
 * @param {boolean} enabled - Whether to enable real-time updates
 */
export const useMultiTicker = (symbols = [], exchange = 'binance', enabled = true) => {
  const [tickers, setTickers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const unsubscribeRefs = useRef({});

  const updateTicker = useCallback((symbol, data) => {
    setTickers(prev => ({
      ...prev,
      [symbol]: {
        symbol: data.symbol,
        price: data.price,
        change24h: data.change24h,
        volume24h: data.volume24h,
        high24h: data.high24h,
        low24h: data.low24h,
        exchange: data.exchange,
        timestamp: data.timestamp,
        loading: false,
        error: null
      }
    }));
  }, []);

  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    // Clean up existing subscriptions
    Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
      if (unsubscribe) unsubscribe();
    });
    unsubscribeRefs.current = {};

    // Subscribe to each symbol
    symbols.forEach(symbol => {
      try {
        unsubscribeRefs.current[symbol] = websocketService.subscribeToTicker(
          symbol,
          (data) => updateTicker(symbol, data),
          exchange
        );
      } catch (error) {
        console.error(`Failed to subscribe to ${symbol}:`, error);
        setError(prev => prev || error.message);
      }
    });

    // Set loading to false after a short delay
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
      unsubscribeRefs.current = {};
    };
  }, [symbols, exchange, enabled, updateTicker]);

  return { tickers, loading, error };
};

/**
 * Hook for WebSocket connection status
 */
export const useWebSocketStatus = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    activeConnections: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(websocketService.getConnectionStatus());
    };

    // Update status immediately
    updateStatus();

    // Update status every few seconds
    const intervalId = setInterval(updateStatus, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return status;
};
