import moment from 'moment';

// Base API URLs for different providers
const API_URLS = {
  BINANCE: 'https://api.binance.com/api/v3',
  COINAPI: 'https://rest.coinapi.io/v1',
  CRYPTOWATCH: 'https://api.cryptowat.ch',
  OKX: 'https://www.okx.com/api/v5',
  // Public OKX API that doesn't require authentication
  OKX_PUBLIC: 'https://www.okx.com/api/v5',
  // Fallback to free crypto APIs if needed
  ALTERNATIVE: 'https://api.coingecko.com/api/v3'
};

// Access API keys from environment variables
const API_KEYS = {
  COINAPI: import.meta.env.VITE_COINAPI_KEY,
  BINANCE: import.meta.env.VITE_BINANCE_KEY,
  CRYPTOWATCH: import.meta.env.VITE_CRYPTOWATCH_KEY,
  OKX: import.meta.env.VITE_OKX_KEY,
  OKX_SECRET: import.meta.env.VITE_OKX_SECRET_KEY,
  ALTERNATIVE: import.meta.env.VITE_ALTERNATIVE_KEY
};

/**
 * Fetches historical OHLCV (Open, High, Low, Close, Volume) data from CoinAPI
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @param {string} period - Time period ('day', 'hour', etc.)
 * @returns {Promise<Object>} - Historical data
 */
export const fetchCoinApiData = async (symbol, startDate, endDate, period = 'day') => {
  try {
    const formattedSymbol = symbol.replace('-', '/');
    const url = `${API_URLS.COINAPI}/ohlcv/${formattedSymbol}/history?period_id=${period}&time_start=${startDate}&time_end=${endDate}`;
    
    console.log('CoinAPI request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'X-CoinAPI-Key': API_KEYS.COINAPI
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinAPI response not OK:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('CoinAPI returned empty or invalid data');
      throw new Error('API returned invalid data format');
    }
    
    console.log('CoinAPI data items received:', data.length);
    
    // Transform the data to match our application's format
    const formattedData = {};
    data.forEach(item => {
      const dateStr = moment(item.time_period_start).format('YYYY-MM-DD');
      formattedData[dateStr] = {
        date: dateStr,
        instrument: { id: symbol },
        open: item.price_open,
        high: item.price_high,
        low: item.price_low,
        close: item.price_close,
        volume: item.volume_traded,
        volatility: calculateVolatility([item.price_high, item.price_low, item.price_close]),
        performance: ((item.price_close - item.price_open) / item.price_open) * 100,
        liquidity: item.volume_traded / 1000000, // Normalized liquidity
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching CoinAPI data:', error);
    return null;
  }
};

/**
 * Fetches historical price data from Binance
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {number} startTime - Start timestamp in milliseconds
 * @param {number} endTime - End timestamp in milliseconds
 * @param {string} interval - Candlestick interval
 * @returns {Promise<Object>} - Historical data
 */
export const fetchBinanceData = async (symbol, startTime, endTime, interval = '1d') => {
  try {
    const url = `${API_URLS.BINANCE}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match our application's format
    const formattedData = {};
    data.forEach(item => {
      const dateStr = moment(item[0]).format('YYYY-MM-DD');
      formattedData[dateStr] = {
        date: dateStr,
        instrument: { id: symbol },
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
        volatility: calculateVolatility([parseFloat(item[2]), parseFloat(item[3]), parseFloat(item[4])]),
        performance: ((parseFloat(item[4]) - parseFloat(item[1])) / parseFloat(item[1])) * 100,
        liquidity: parseFloat(item[5]) / 1000000, // Normalized liquidity
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching Binance data:', error);
    return null;
  }
};

/**
 * Fetches price data from CoinGecko (alternative free API)
 * @param {string} coinId - Coin ID (e.g., 'bitcoin')
 * @param {string} currency - Currency (e.g., 'usd')
 * @param {number} days - Number of days of data to fetch
 * @returns {Promise<Object>} - Historical data
 */
export const fetchCoinGeckoData = async (coinId, currency = 'usd', days = 90) => {
  try {
    const url = `${API_URLS.ALTERNATIVE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match our application's format
    const formattedData = {};
    
    // CoinGecko returns separate arrays for prices, market_caps, and volumes
    // We need to merge them by timestamp
    for (let i = 0; i < data.prices.length; i++) {
      const timestamp = data.prices[i][0];
      const dateStr = moment(timestamp).format('YYYY-MM-DD');
      
      // Get the daily high and low by approximation (CoinGecko doesn't provide OHLC by default)
      let dayPrices = [];
      let dayIndex = i;
      const currentDay = moment(timestamp).startOf('day');
      
      // Collect all prices for the same day
      while (dayIndex < data.prices.length && 
             moment(data.prices[dayIndex][0]).startOf('day').isSame(currentDay)) {
        dayPrices.push(data.prices[dayIndex][1]);
        dayIndex++;
      }
      
      const open = dayPrices[0] || 0;
      const close = dayPrices[dayPrices.length - 1] || 0;
      const high = Math.max(...dayPrices);
      const low = Math.min(...dayPrices);
      const volume = data.total_volumes[i] ? data.total_volumes[i][1] : 0;
      
      formattedData[dateStr] = {
        date: dateStr,
        instrument: { id: coinId.toUpperCase() },
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
        volatility: calculateVolatility(dayPrices),
        performance: ((close - open) / open) * 100,
        liquidity: volume / 1000000, // Normalized liquidity
      };
      
      // Skip to the next day
      i = dayIndex - 1;
    }
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return null;
  }
};

/**
 * Helper function to calculate volatility from price data
 * @param {Array<number>} prices - Array of price points
 * @returns {number} - Calculated volatility
 */
const calculateVolatility = (prices) => {
  if (!prices || prices.length <= 1) return 0;
  
  // Calculate mean
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Calculate sum of squares
  const sumOfSquares = prices.reduce((sum, price) => {
    const diff = price - mean;
    return sum + diff * diff;
  }, 0);
  
  // Standard deviation
  const stdDev = Math.sqrt(sumOfSquares / (prices.length - 1));
  
  // Return volatility as percentage of mean (coefficient of variation)
  return (stdDev / mean) * 100;
};

/**
 * Fetches historical price data from OKX
 * @param {string} symbol - Trading pair symbol (e.g., 'BTC-USDT')
 * @param {string} interval - Candle interval (e.g., '1D', '1H', etc.)
 * @param {number} limit - Number of candles to fetch (max 100)
 * @param {string} startTime - Optional start time (ISO string)
 * @param {string} endTime - Optional end time (ISO string)
 * @returns {Promise<Object>} - Historical data in application format
 */
export const fetchOKXData = async (symbol, interval = '1D', limit = 90, startTime = null, endTime = null) => {
  try {
    console.log(`Fetching OKX data for ${symbol} (${interval}, ${limit} candles)`);
    
    // Process the symbol to match OKX format
    let okxSymbol = symbol;
    
    // Handle different symbol formats
    if (symbol.includes('-USD')) {
      // Convert BTC-USD to BTC-USDT for OKX
      okxSymbol = symbol.replace('-USD', '-USDT');
    } else if (symbol.includes('USDT')) {
      // Handle BTCUSDT format (without hyphen)
      if (!symbol.includes('-')) {
        const base = symbol.replace('USDT', '');
        okxSymbol = `${base}-USDT`;
      }
    } else if (!symbol.includes('-')) {
      // Add -USDT suffix if no pair is specified
      okxSymbol = `${symbol}-USDT`;
    }
    
    console.log(`Using symbol: ${okxSymbol}`);
    
    // Use the candles endpoint which works with public access
    const url = `${API_URLS.OKX_PUBLIC}/market/candles`;
    
    // Build query parameters
    const params = new URLSearchParams({
      instId: okxSymbol,
      bar: interval,  // Add the interval parameter (bar)
      limit: limit.toString()
    });
    
    // Add time parameters if provided
    if (startTime) {
      params.append('after', moment(startTime).valueOf().toString());
    }
    
    if (endTime) {
      params.append('before', moment(endTime).valueOf().toString());
    }
    
    // This is a public endpoint, so no special auth headers needed
    const headers = {
      'Content-Type': 'application/json'
    };
    
    console.log(`Making request to OKX: ${url}?${params}`);
    const response = await fetch(`${url}?${params}`, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OKX API error (${response.status}):`, errorText);
      throw new Error(`OKX API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('OKX API response:', data);
    
    // Check if we have valid data
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response from OKX API:', data);
      
      // Try with SWAP suffix for futures
      try {
        let altSymbol = symbol.includes('-SWAP') ? symbol : `${okxSymbol}-SWAP`;
        console.log(`Trying alternative symbol: ${altSymbol}`);
        
        const altParams = new URLSearchParams({
          instId: altSymbol,
          limit: limit.toString()
        });
        
        const altResponse = await fetch(`${url}?${altParams}`, { headers });
        const altData = await altResponse.json();
        
        // If this worked, use the alternative data
        if (altData.code === '0' && altData.data && Array.isArray(altData.data)) {
          console.log('Found data with alternative symbol format!');
          return formatOKXData(altData.data, symbol);
        }
        
        // Try another format as a final attempt
        console.log('Testing API connectivity with known symbol');
        const tickerUrl = `${API_URLS.OKX_PUBLIC}/market/ticker`;
        const tickerParams = new URLSearchParams({ instId: 'BTC-USDT' });
        
        const tickerResponse = await fetch(`${tickerUrl}?${tickerParams}`, { headers });
        const tickerData = await tickerResponse.json();
        
        if (tickerData.code === '0') {
          console.log('API is accessible, but symbol not found');
        }
      } catch (innerError) {
        console.error('Error in alternative symbol tests:', innerError);
      }
      
      return {};
    }
    
    // Format the data using our helper function
    return formatOKXData(data.data, symbol);
  } catch (error) {
    console.error('Error fetching OKX data:', error);
    return {};
  }
};

/**
 * Helper function to format OKX candle data to our app format
 * @param {Array<Array>} candleData - Raw candle data from OKX API
 * @param {string} symbol - Trading pair symbol
 * @returns {Object} - Formatted data in application format
 */
const formatOKXData = (candleData, symbol) => {
  if (!Array.isArray(candleData) || candleData.length === 0) {
    console.error('Invalid candle data received');
    return {};
  }
  
  const formattedData = {};
  
  // OKX candle format: [timestamp, open, high, low, close, volume, ...]
  candleData.forEach(candle => {
    if (!candle || candle.length < 6) {
      console.warn('Skipping invalid candle');
      return;
    }
    
    try {
      // For history candles, timestamp is in ms
      const timestamp = parseInt(candle[0]);
      const dateStr = moment(timestamp).format('YYYY-MM-DD');
      
      // Parse numeric values safely with fallbacks
      const open = parseFloat(candle[1]) || 0;
      const high = parseFloat(candle[2]) || 0;
      const low = parseFloat(candle[3]) || 0;
      const close = parseFloat(candle[4]) || 0;
      const volume = parseFloat(candle[5]) || 0;
      
      // Calculate metrics safely
      const performance = open !== 0 ? ((close - open) / open) * 100 : 0;
      const volatility = low !== 0 ? ((high - low) / low) * 100 : 0;
      const liquidity = volume / 1000000; // Normalized
      
      formattedData[dateStr] = {
        date: dateStr,
        instrument: { id: symbol },
        open,
        high,
        low,
        close,
        volume,
        performance,
        volatility,
        liquidity
      };
    } catch (error) {
      console.warn('Error processing candle data point:', error.message);
    }
  });
  
  return formattedData;
};

// Export API_URLS for other modules that might need it
export { API_URLS };
