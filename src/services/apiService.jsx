// CoinGecko API Service for Real Market Data

// CoinGecko symbol mapping - map our app symbols to CoinGecko IDs
export const COINGECKO_SYMBOLS = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum', 
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'XRP': 'ripple'
};

// Base CoinGecko API URL (no API key required for basic endpoints)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetch extended historical market data (up to multiple years)
 * Uses multiple API calls to get more historical data than the 365-day limit
 * @param {string} symbol - The cryptocurrency symbol (BTC, ETH, etc.)
 * @param {number} years - Number of years of historical data to fetch (max 3 for performance)
 * @returns {Promise<Object>} Extended market data 
 */
export const fetchExtendedMarketData = async (symbol = 'BTC', years = 2) => {
  try {
    console.log(`🌐 Fetching extended market data for ${symbol} (${years} years)...`);
    
    // Map our symbol to CoinGecko ID
    let coinGeckoId = COINGECKO_SYMBOLS[symbol.toUpperCase()];
    if (!coinGeckoId) {
      console.warn(`⚠️ Symbol ${symbol} not found in CoinGecko mapping, using BTC as fallback`);
      coinGeckoId = 'bitcoin';
    }

    const allDailyData = [];
    const maxYears = Math.min(years, 3); // Limit to 3 years for performance
    
    // Fetch data in chunks of 365 days
    for (let yearOffset = 0; yearOffset < maxYears; yearOffset++) {
      const daysToFetch = yearOffset === 0 ? 365 : 365;
      const fromTimestamp = Math.floor(Date.now() / 1000) - (daysToFetch * 24 * 60 * 60 * (yearOffset + 1));
      const toTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60 * yearOffset);
      
      console.log(`📈 Fetching year ${yearOffset + 1}/${maxYears} data...`);
      
      try {
        const historicalUrl = `${COINGECKO_BASE_URL}/coins/${coinGeckoId}/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;
        
        const response = await fetch(historicalUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.prices && data.prices.length > 0) {
            data.prices.forEach((pricePoint, index) => {
              const timestamp = pricePoint[0];
              const price = pricePoint[1];
              const volume = data.total_volumes?.[index]?.[1] || 0;
              
              allDailyData.push({
                date: new Date(timestamp).toISOString().split('T')[0],
                timestamp: timestamp,
                price: price,
                volume: volume,
                change: index > 0 ? ((price - data.prices[index-1][1]) / data.prices[index-1][1] * 100) : 0
              });
            });
          }
        } else {
          console.warn(`⚠️ Failed to fetch year ${yearOffset + 1} data: ${response.status}`);
        }
        
        // Add delay between requests to respect rate limits
        if (yearOffset < maxYears - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.warn(`⚠️ Error fetching year ${yearOffset + 1} data:`, error);
      }
    }

    // Get current price data as well
    const currentDataUrl = `${COINGECKO_BASE_URL}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    
    let currentData = {};
    try {
      const currentResponse = await fetch(currentDataUrl);
      if (currentResponse.ok) {
        currentData = await currentResponse.json();
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch current data:', error);
    }

    const coinData = currentData[coinGeckoId] || {};
    
    const result = {
      symbol: symbol.toUpperCase(),
      coinGeckoId: coinGeckoId,
      currentPrice: coinData.usd || (allDailyData.length > 0 ? allDailyData[allDailyData.length - 1].price : 0),
      marketCap: coinData.usd_market_cap || 0,
      volume24h: coinData.usd_24h_vol || 0,
      change24h: coinData.usd_24h_change || 0,
      dailyData: allDailyData.sort((a, b) => new Date(a.date) - new Date(b.date)), // Sort by date
      dataSource: 'coingecko-extended',
      lastUpdated: new Date().toISOString(),
      yearsOfData: maxYears
    };

    console.log(`🎯 Extended data for ${symbol}:`, {
      currentPrice: result.currentPrice,
      dailyDataPoints: result.dailyData.length,
      dateRange: result.dailyData.length > 0 ? `${result.dailyData[0].date} to ${result.dailyData[result.dailyData.length-1].date}` : 'No data',
      dataSource: result.dataSource
    });

    return result;

  } catch (error) {
    console.error(`❌ Error fetching extended data for ${symbol}:`, error);
    
    // Return fallback data structure
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      dailyData: [],
      dataSource: 'error',
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Fetch real market data from CoinGecko API
 * @param {string} symbol - The cryptocurrency symbol (BTC, ETH, etc.)
 * @returns {Promise<Object>} Market data with prices, volumes, and historical data
 */
export const fetchRealMarketData = async (symbol = 'BTC') => {
  try {
    console.log(`🌐 Fetching real market data for ${symbol} from CoinGecko...`);
    
    // Map our symbol to CoinGecko ID
    let coinGeckoId = COINGECKO_SYMBOLS[symbol.toUpperCase()];
    if (!coinGeckoId) {
      console.warn(`⚠️ Symbol ${symbol} not found in CoinGecko mapping, using BTC as fallback`);
      coinGeckoId = 'bitcoin';
    }

    // Fetch current price and market data
    const currentDataUrl = `${COINGECKO_BASE_URL}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    
    console.log(`📡 Fetching current data from: ${currentDataUrl}`);
    const currentResponse = await fetch(currentDataUrl);
    
    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    console.log(`✅ Current data received:`, currentData);

    // Fetch historical data (365 days - maximum for free tier)
    const historicalUrl = `${COINGECKO_BASE_URL}/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=365&interval=daily`;
    
    console.log(`📈 Fetching historical data from: ${historicalUrl}`);
    const historicalResponse = await fetch(historicalUrl);
    
    if (!historicalResponse.ok) {
      throw new Error(`HTTP error! status: ${historicalResponse.status}`);
    }
    
    const historicalData = await historicalResponse.json();
    console.log(`✅ Historical data received:`, historicalData);

    // Process the data
    const coinData = currentData[coinGeckoId];
    if (!coinData) {
      throw new Error(`No data found for ${coinGeckoId}`);
    }

    // Format historical prices for calendar display
    const dailyPrices = [];
    if (historicalData.prices && historicalData.prices.length > 0) {
      historicalData.prices.forEach((pricePoint, index) => {
        const timestamp = pricePoint[0];
        const price = pricePoint[1];
        const volume = historicalData.total_volumes?.[index]?.[1] || 0;
        
        dailyPrices.push({
          date: new Date(timestamp).toISOString().split('T')[0],
          timestamp: timestamp,
          price: price,
          volume: volume,
          change: index > 0 ? ((price - historicalData.prices[index-1][1]) / historicalData.prices[index-1][1] * 100) : 0
        });
      });
    }

    const result = {
      symbol: symbol.toUpperCase(),
      coinGeckoId: coinGeckoId,
      currentPrice: coinData.usd,
      marketCap: coinData.usd_market_cap,
      volume24h: coinData.usd_24h_vol,
      change24h: coinData.usd_24h_change,
      dailyData: dailyPrices,
      dataSource: 'coingecko',
      lastUpdated: new Date().toISOString()
    };

    console.log(`🎯 Processed data for ${symbol}:`, {
      currentPrice: result.currentPrice,
      dailyDataPoints: result.dailyData.length,
      dataSource: result.dataSource
    });

    return result;

  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error);
    
    // Return fallback data structure
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      dailyData: [],
      dataSource: 'error',
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Fetch multiple cryptocurrencies at once
 * @param {Array<string>} symbols - Array of symbols to fetch
 * @returns {Promise<Object>} Object with symbol keys and market data values
 */
export const fetchMultipleMarketData = async (symbols = ['BTC', 'ETH', 'SOL']) => {
  console.log(`🔄 Fetching market data for multiple symbols:`, symbols);
  
  const results = {};
  
  // Fetch all symbols in parallel
  const promises = symbols.map(async (symbol) => {
    try {
      const data = await fetchRealMarketData(symbol);
      return { symbol, data };
    } catch (error) {
      console.error(`❌ Error fetching ${symbol}:`, error);
      return { 
        symbol, 
        data: { 
          symbol, 
          error: error.message, 
          dataSource: 'error' 
        } 
      };
    }
  });

  const allResults = await Promise.all(promises);
  
  // Convert to object format
  allResults.forEach(({ symbol, data }) => {
    results[symbol] = data;
  });

  console.log(`✅ Multi-symbol fetch complete:`, Object.keys(results));
  return results;
};

// Export default as main fetch function
export default fetchRealMarketData;
