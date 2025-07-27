/**
 * Enhanced API Service for Multiple Financial Instruments
 * Supports crypto, stocks, forex, commodities, and indices
 */

// Enhanced symbol mappings for different asset classes
export const ASSET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'stock', 
  FOREX: 'forex',
  COMMODITY: 'commodity',
  INDEX: 'index'
};

// Comprehensive symbol mappings
export const SYMBOLS = {
  // Cryptocurrencies (CoinGecko)
  CRYPTO: {
    'BTC': { id: 'bitcoin', name: 'Bitcoin', exchange: 'coingecko' },
    'ETH': { id: 'ethereum', name: 'Ethereum', exchange: 'coingecko' },
    'SOL': { id: 'solana', name: 'Solana', exchange: 'coingecko' },
    'ADA': { id: 'cardano', name: 'Cardano', exchange: 'coingecko' },
    'DOT': { id: 'polkadot', name: 'Polkadot', exchange: 'coingecko' },
    'XRP': { id: 'ripple', name: 'Ripple', exchange: 'coingecko' },
    'MATIC': { id: 'matic-network', name: 'Polygon', exchange: 'coingecko' },
    'AVAX': { id: 'avalanche-2', name: 'Avalanche', exchange: 'coingecko' },
    'LINK': { id: 'chainlink', name: 'Chainlink', exchange: 'coingecko' },
    'UNI': { id: 'uniswap', name: 'Uniswap', exchange: 'coingecko' }
  },
  
  // Stocks (Alpha Vantage - requires API key for real data)
  STOCKS: {
    'AAPL': { id: 'AAPL', name: 'Apple Inc.', exchange: 'nasdaq' },
    'GOOGL': { id: 'GOOGL', name: 'Alphabet Inc.', exchange: 'nasdaq' },
    'MSFT': { id: 'MSFT', name: 'Microsoft Corp.', exchange: 'nasdaq' },
    'AMZN': { id: 'AMZN', name: 'Amazon.com Inc.', exchange: 'nasdaq' },
    'TSLA': { id: 'TSLA', name: 'Tesla Inc.', exchange: 'nasdaq' },
    'META': { id: 'META', name: 'Meta Platforms Inc.', exchange: 'nasdaq' },
    'NVDA': { id: 'NVDA', name: 'NVIDIA Corp.', exchange: 'nasdaq' },
    'NFLX': { id: 'NFLX', name: 'Netflix Inc.', exchange: 'nasdaq' },
    'AMD': { id: 'AMD', name: 'Advanced Micro Devices', exchange: 'nasdaq' },
    'INTC': { id: 'INTC', name: 'Intel Corp.', exchange: 'nasdaq' }
  },
  
  // Forex pairs (using exchange rates API)
  FOREX: {
    'EURUSD': { id: 'EUR', name: 'Euro/US Dollar', base: 'EUR', quote: 'USD' },
    'GBPUSD': { id: 'GBP', name: 'British Pound/US Dollar', base: 'GBP', quote: 'USD' },
    'USDJPY': { id: 'JPY', name: 'US Dollar/Japanese Yen', base: 'USD', quote: 'JPY' },
    'AUDUSD': { id: 'AUD', name: 'Australian Dollar/US Dollar', base: 'AUD', quote: 'USD' },
    'USDCAD': { id: 'CAD', name: 'US Dollar/Canadian Dollar', base: 'USD', quote: 'CAD' },
    'USDCHF': { id: 'CHF', name: 'US Dollar/Swiss Franc', base: 'USD', quote: 'CHF' },
    'EURGBP': { id: 'EUR', name: 'Euro/British Pound', base: 'EUR', quote: 'GBP' },
    'EURJPY': { id: 'EUR', name: 'Euro/Japanese Yen', base: 'EUR', quote: 'JPY' }
  },
  
  // Commodities (using commodity APIs or demo data)
  COMMODITIES: {
    'GOLD': { id: 'XAU', name: 'Gold', unit: 'oz' },
    'SILVER': { id: 'XAG', name: 'Silver', unit: 'oz' },
    'OIL': { id: 'CL', name: 'Crude Oil WTI', unit: 'barrel' },
    'BRENT': { id: 'BZ', name: 'Brent Oil', unit: 'barrel' },
    'NATGAS': { id: 'NG', name: 'Natural Gas', unit: 'MMBtu' },
    'COPPER': { id: 'HG', name: 'Copper', unit: 'lb' },
    'WHEAT': { id: 'ZW', name: 'Wheat', unit: 'bushel' },
    'CORN': { id: 'ZC', name: 'Corn', unit: 'bushel' }
  },
  
  // Indices
  INDICES: {
    'SPX': { id: 'SPX', name: 'S&P 500 Index', exchange: 'index' },
    'NDX': { id: 'NDX', name: 'NASDAQ 100 Index', exchange: 'index' },
    'DJI': { id: 'DJI', name: 'Dow Jones Industrial Average', exchange: 'index' },
    'VIX': { id: 'VIX', name: 'Volatility Index', exchange: 'index' },
    'RUT': { id: 'RUT', name: 'Russell 2000 Index', exchange: 'index' }
  }
};

// API endpoints for different data sources
const API_ENDPOINTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3',
  EXCHANGE_RATES: 'https://api.exchangerate-api.com/v4/latest',
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query', // Requires API key
  TWELVE_DATA: 'https://api.twelvedata.com', // Alternative for stocks
};

/**
 * Detect asset type from symbol
 */
export const detectAssetType = (symbol) => {
  // Add validation for symbol parameter
  if (!symbol || typeof symbol !== 'string') {
    console.warn('[detectAssetType] Invalid symbol:', symbol);
    return ASSET_TYPES.CRYPTO; // Default fallback
  }
  
  const upperSymbol = symbol.toUpperCase();
  
  if (SYMBOLS.CRYPTO[upperSymbol]) return ASSET_TYPES.CRYPTO;
  if (SYMBOLS.STOCKS[upperSymbol]) return ASSET_TYPES.STOCK;
  if (SYMBOLS.FOREX[upperSymbol]) return ASSET_TYPES.FOREX;
  if (SYMBOLS.COMMODITIES[upperSymbol]) return ASSET_TYPES.COMMODITY;
  if (SYMBOLS.INDICES[upperSymbol]) return ASSET_TYPES.INDEX;
  
  // Default to crypto for backwards compatibility
  return ASSET_TYPES.CRYPTO;
};

/**
 * Enhanced market data fetcher supporting multiple asset types
 */
export const fetchEnhancedMarketData = async (symbol, assetType = null) => {
  const detectedType = assetType || detectAssetType(symbol);
  
  console.log(`🌐 Fetching ${detectedType} data for ${symbol}...`);
  
  try {
    switch (detectedType) {
      case ASSET_TYPES.CRYPTO:
        return await fetchCryptoData(symbol);
      
      case ASSET_TYPES.STOCK:
        return await fetchStockData(symbol);
      
      case ASSET_TYPES.FOREX:
        return await fetchForexData(symbol);
      
      case ASSET_TYPES.COMMODITY:
        return await fetchCommodityData(symbol);
      
      case ASSET_TYPES.INDEX:
        return await fetchIndexData(symbol);
      
      default:
        return await fetchCryptoData(symbol);
    }
  } catch (error) {
    console.error(`❌ Error fetching ${detectedType} data for ${symbol}:`, error);
    return generateFallbackData(symbol, detectedType);
  }
};

/**
 * Fetch cryptocurrency data from CoinGecko
 */
const fetchCryptoData = async (symbol) => {
  const symbolData = SYMBOLS.CRYPTO[symbol.toUpperCase()];
  if (!symbolData) {
    throw new Error(`Cryptocurrency symbol ${symbol} not supported`);
  }
  
  const coinGeckoId = symbolData.id;
  
  // Get current price data
  const currentUrl = `${API_ENDPOINTS.COINGECKO}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
  const currentResponse = await fetch(currentUrl);
  
  if (!currentResponse.ok) {
    throw new Error(`CoinGecko API error: ${currentResponse.status}`);
  }
  
  const currentData = await currentResponse.json();
  const coinData = currentData[coinGeckoId];
  
  // Get historical data
  const historicalUrl = `${API_ENDPOINTS.COINGECKO}/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=365&interval=daily`;
  const historicalResponse = await fetch(historicalUrl);
  
  if (!historicalResponse.ok) {
    throw new Error(`CoinGecko historical API error: ${historicalResponse.status}`);
  }
  
  const historicalData = await historicalResponse.json();
  
  // Process historical data
  const dailyData = [];
  if (historicalData.prices) {
    historicalData.prices.forEach((pricePoint, index) => {
      const timestamp = pricePoint[0];
      const price = pricePoint[1];
      const volume = historicalData.total_volumes?.[index]?.[1] || 0;
      
      dailyData.push({
        date: new Date(timestamp).toISOString().split('T')[0],
        timestamp: timestamp,
        price: price,
        volume: volume,
        change: index > 0 ? ((price - historicalData.prices[index-1][1]) / historicalData.prices[index-1][1] * 100) : 0
      });
    });
  }
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbolData.name,
    assetType: ASSET_TYPES.CRYPTO,
    currentPrice: coinData.usd,
    marketCap: coinData.usd_market_cap,
    volume24h: coinData.usd_24h_vol,
    change24h: coinData.usd_24h_change,
    dailyData: dailyData,
    dataSource: 'coingecko',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Fetch stock data (using demo data for now - requires API key for real data)
 */
const fetchStockData = async (symbol) => {
  const symbolData = SYMBOLS.STOCKS[symbol.toUpperCase()];
  if (!symbolData) {
    throw new Error(`Stock symbol ${symbol} not supported`);
  }
  
  // For now, return demo data since Alpha Vantage requires API key
  // In production, you would implement:
  // const response = await fetch(`${API_ENDPOINTS.ALPHA_VANTAGE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=YOUR_API_KEY`);
  
  return generateStockDemoData(symbol, symbolData);
};

/**
 * Fetch forex data using exchange rates API
 */
const fetchForexData = async (symbol) => {
  const symbolData = SYMBOLS.FOREX[symbol.toUpperCase()];
  if (!symbolData) {
    throw new Error(`Forex symbol ${symbol} not supported`);
  }
  
  try {
    // Get current exchange rate
    const response = await fetch(`${API_ENDPOINTS.EXCHANGE_RATES}/${symbolData.base}`);
    
    if (!response.ok) {
      throw new Error(`Exchange rates API error: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates[symbolData.quote];
    
    // Generate historical data (demo for now)
    return generateForexDemoData(symbol, symbolData, rate);
  } catch (error) {
    console.warn('Using demo forex data due to API limitation:', error);
    return generateForexDemoData(symbol, symbolData);
  }
};

/**
 * Fetch commodity data (demo data for now)
 */
const fetchCommodityData = async (symbol) => {
  const symbolData = SYMBOLS.COMMODITIES[symbol.toUpperCase()];
  if (!symbolData) {
    throw new Error(`Commodity symbol ${symbol} not supported`);
  }
  
  return generateCommodityDemoData(symbol, symbolData);
};

/**
 * Fetch index data (demo data for now)
 */
const fetchIndexData = async (symbol) => {
  const symbolData = SYMBOLS.INDICES[symbol.toUpperCase()];
  if (!symbolData) {
    throw new Error(`Index symbol ${symbol} not supported`);
  }
  
  return generateIndexDemoData(symbol, symbolData);
};

/**
 * Generate demo stock data
 */
const generateStockDemoData = (symbol, symbolData) => {
  const basePrice = getBasePriceForStock(symbol);
  const dailyData = generateHistoricalData(basePrice, ASSET_TYPES.STOCK);
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbolData.name,
    assetType: ASSET_TYPES.STOCK,
    currentPrice: dailyData[dailyData.length - 1]?.price || basePrice,
    marketCap: basePrice * 1000000000, // Demo market cap
    volume24h: Math.random() * 50000000 + 10000000, // Demo volume
    change24h: (Math.random() - 0.5) * 10, // Random change -5% to +5%
    dailyData: dailyData,
    dataSource: 'demo-stock',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Generate demo forex data
 */
const generateForexDemoData = (symbol, symbolData, currentRate = null) => {
  const baseRate = currentRate || getBaseRateForForex(symbol);
  const dailyData = generateHistoricalData(baseRate, ASSET_TYPES.FOREX);
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbolData.name,
    assetType: ASSET_TYPES.FOREX,
    currentPrice: dailyData[dailyData.length - 1]?.price || baseRate,
    volume24h: Math.random() * 1000000000 + 500000000, // Demo volume
    change24h: (Math.random() - 0.5) * 2, // Random change -1% to +1%
    dailyData: dailyData,
    dataSource: currentRate ? 'exchange-rates-api' : 'demo-forex',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Generate demo commodity data
 */
const generateCommodityDemoData = (symbol, symbolData) => {
  const basePrice = getBasePriceForCommodity(symbol);
  const dailyData = generateHistoricalData(basePrice, ASSET_TYPES.COMMODITY);
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbolData.name,
    assetType: ASSET_TYPES.COMMODITY,
    currentPrice: dailyData[dailyData.length - 1]?.price || basePrice,
    volume24h: Math.random() * 100000 + 50000, // Demo volume
    change24h: (Math.random() - 0.5) * 6, // Random change -3% to +3%
    dailyData: dailyData,
    dataSource: 'demo-commodity',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Generate demo index data
 */
const generateIndexDemoData = (symbol, symbolData) => {
  const basePrice = getBasePriceForIndex(symbol);
  const dailyData = generateHistoricalData(basePrice, ASSET_TYPES.INDEX);
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbolData.name,
    assetType: ASSET_TYPES.INDEX,
    currentPrice: dailyData[dailyData.length - 1]?.price || basePrice,
    change24h: (Math.random() - 0.5) * 4, // Random change -2% to +2%
    dailyData: dailyData,
    dataSource: 'demo-index',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Generate historical data for different asset types
 */
const generateHistoricalData = (basePrice, assetType) => {
  const data = [];
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movements based on asset type
    let volatility;
    switch (assetType) {
      case ASSET_TYPES.CRYPTO:
        volatility = 0.05; // 5% daily volatility
        break;
      case ASSET_TYPES.STOCK:
        volatility = 0.02; // 2% daily volatility
        break;
      case ASSET_TYPES.FOREX:
        volatility = 0.01; // 1% daily volatility
        break;
      case ASSET_TYPES.COMMODITY:
        volatility = 0.03; // 3% daily volatility
        break;
      case ASSET_TYPES.INDEX:
        volatility = 0.015; // 1.5% daily volatility
        break;
      default:
        volatility = 0.02;
    }
    
    const dailyChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + dailyChange * (365 - i) / 365);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      price: Math.max(price, basePrice * 0.1), // Prevent negative prices
      volume: Math.random() * 1000000 + 100000,
      change: dailyChange * 100
    });
  }
  
  return data;
};

/**
 * Helper functions to get base prices for different asset types
 */
const getBasePriceForStock = (symbol) => {
  const prices = {
    'AAPL': 175,
    'GOOGL': 125,
    'MSFT': 350,
    'AMZN': 95,
    'TSLA': 250,
    'META': 280,
    'NVDA': 400,
    'NFLX': 380,
    'AMD': 110,
    'INTC': 50
  };
  return prices[symbol.toUpperCase()] || 100;
};

const getBaseRateForForex = (symbol) => {
  const rates = {
    'EURUSD': 1.08,
    'GBPUSD': 1.25,
    'USDJPY': 150,
    'AUDUSD': 0.67,
    'USDCAD': 1.35,
    'USDCHF': 0.92,
    'EURGBP': 0.86,
    'EURJPY': 162
  };
  return rates[symbol.toUpperCase()] || 1.0;
};

const getBasePriceForCommodity = (symbol) => {
  const prices = {
    'GOLD': 2000,
    'SILVER': 24,
    'OIL': 75,
    'BRENT': 80,
    'NATGAS': 3.5,
    'COPPER': 3.8,
    'WHEAT': 6.5,
    'CORN': 4.2
  };
  return prices[symbol.toUpperCase()] || 100;
};

const getBasePriceForIndex = (symbol) => {
  const prices = {
    'SPX': 4500,
    'NDX': 15000,
    'DJI': 35000,
    'VIX': 20,
    'RUT': 1800
  };
  return prices[symbol.toUpperCase()] || 1000;
};

/**
 * Generate fallback data when API calls fail
 */
const generateFallbackData = (symbol, assetType) => {
  console.log(`🔄 Generating fallback data for ${symbol} (${assetType})`);
  
  let basePrice;
  switch (assetType) {
    case ASSET_TYPES.STOCK:
      basePrice = getBasePriceForStock(symbol);
      break;
    case ASSET_TYPES.FOREX:
      basePrice = getBaseRateForForex(symbol);
      break;
    case ASSET_TYPES.COMMODITY:
      basePrice = getBasePriceForCommodity(symbol);
      break;
    case ASSET_TYPES.INDEX:
      basePrice = getBasePriceForIndex(symbol);
      break;
    default:
      basePrice = 45000; // Default crypto price
  }
  
  const dailyData = generateHistoricalData(basePrice, assetType);
  
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol} (Fallback)`,
    assetType: assetType,
    currentPrice: dailyData[dailyData.length - 1]?.price || basePrice,
    change24h: (Math.random() - 0.5) * 4,
    dailyData: dailyData,
    dataSource: 'fallback',
    error: 'API unavailable, using generated data',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Get all available instruments grouped by asset type
 */
export const getAllInstruments = () => {
  const instruments = [];
  
  // Add crypto instruments
  Object.entries(SYMBOLS.CRYPTO).forEach(([symbol, data]) => {
    instruments.push({
      id: symbol,
      name: `${data.name} (${symbol})`,
      symbol: symbol,
      assetType: ASSET_TYPES.CRYPTO,
      category: 'Cryptocurrency'
    });
  });
  
  // Add stock instruments
  Object.entries(SYMBOLS.STOCKS).forEach(([symbol, data]) => {
    instruments.push({
      id: symbol,
      name: `${data.name} (${symbol})`,
      symbol: symbol,
      assetType: ASSET_TYPES.STOCK,
      category: 'Stock'
    });
  });
  
  // Add forex instruments
  Object.entries(SYMBOLS.FOREX).forEach(([symbol, data]) => {
    instruments.push({
      id: symbol,
      name: `${data.name}`,
      symbol: symbol,
      assetType: ASSET_TYPES.FOREX,
      category: 'Forex'
    });
  });
  
  // Add commodity instruments
  Object.entries(SYMBOLS.COMMODITIES).forEach(([symbol, data]) => {
    instruments.push({
      id: symbol,
      name: `${data.name}`,
      symbol: symbol,
      assetType: ASSET_TYPES.COMMODITY,
      category: 'Commodity'
    });
  });
  
  // Add index instruments
  Object.entries(SYMBOLS.INDICES).forEach(([symbol, data]) => {
    instruments.push({
      id: symbol,
      name: `${data.name}`,
      symbol: symbol,
      assetType: ASSET_TYPES.INDEX,
      category: 'Index'
    });
  });
  
  return instruments;
};

export default fetchEnhancedMarketData;
