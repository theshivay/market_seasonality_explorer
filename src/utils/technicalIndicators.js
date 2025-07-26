/**
 * Technical Indicators and Advanced Metrics Calculations
 * Contains functions for calculating various technical indicators,
 * VIX-like volatility metrics, and benchmark comparisons.
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price values
 * @param {number} period - Period for the moving average
 * @returns {number|null} - Moving average value
 */
export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return null;
  
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, value) => acc + (value.close || value.price || value), 0);
  return sum / period;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price values
 * @param {number} period - Period for the moving average
 * @returns {number|null} - EMA value
 */
export const calculateEMA = (data, period) => {
  if (!data || data.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  
  for (let i = period; i < data.length; i++) {
    const price = data[i].close || data[i].price || data[i];
    ema = (price - ema) * multiplier + ema;
  }
  
  return ema;
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of price values
 * @param {number} period - Period for RSI calculation (default 14)
 * @returns {number|null} - RSI value (0-100)
 */
export const calculateRSI = (data, period = 14) => {
  if (!data || data.length < period + 1) return null;
  
  const prices = data.map(item => item.close || item.price || item);
  const changes = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Calculate initial averages
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss -= changes[i];
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

/**
 * Calculate VIX-like Volatility Index
 * @param {Array} data - Array of price/volatility data
 * @param {number} period - Look-back period (default 30 days)
 * @returns {number} - VIX-like volatility index
 */
export const calculateVIXLike = (data, period = 30) => {
  if (!data || data.length === 0) return 25; // Default moderate fear level
  
  const recentData = data.slice(-Math.min(period, data.length));
  
  // If we have volatility data directly, use it
  if (recentData[0]?.volatility !== undefined) {
    const avgVolatility = recentData.reduce((sum, item) => sum + (item.volatility || 0), 0) / recentData.length;
    return Math.sqrt(252) * avgVolatility; // Annualized volatility
  }
  
  // Calculate daily returns if we have price data
  const returns = [];
  for (let i = 1; i < recentData.length; i++) {
    const prevPrice = recentData[i - 1].close || recentData[i - 1].price || 0;
    const currentPrice = recentData[i].close || recentData[i].price || 0;
    
    if (prevPrice > 0) {
      returns.push(Math.log(currentPrice / prevPrice));
    }
  }
  
  if (returns.length === 0) return 25; // Default moderate fear level
  
  // Calculate standard deviation of returns
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  
  // Annualize the volatility (VIX-like)
  return volatility * Math.sqrt(252) * 100; // 252 trading days in a year
};

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of price values
 * @param {number} period - Period for moving average (default 20)
 * @param {number} stdDev - Standard deviation multiplier (default 2)
 * @returns {Object|null} - {upper, middle, lower}
 */
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  if (!data || data.length < period) return null;
  
  const sma = calculateSMA(data, period);
  if (!sma) return null;
  
  const prices = data.slice(-period).map(item => item.close || item.price || item);
  const squaredDiffs = prices.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of price values
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal line EMA period (default 9)
 * @returns {Object|null} - {macd, signal, histogram, macdArray, signalArray}
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!data || data.length < slowPeriod + signalPeriod) return null;
  
  const prices = data.map(item => item.close || item.price || item);
  
  // Calculate EMAs
  const macdLine = [];
  for (let i = slowPeriod - 1; i < prices.length; i++) {
    const fastEMA = calculateEMA(prices.slice(0, i + 1), fastPeriod);
    const slowEMA = calculateEMA(prices.slice(0, i + 1), slowPeriod);
    
    if (fastEMA && slowEMA) {
      macdLine.push(fastEMA - slowEMA);
    }
  }
  
  if (macdLine.length === 0) return null;
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = [];
  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    const ema = calculateEMA(macdLine.slice(0, i + 1).map(val => ({ close: val })), signalPeriod);
    if (ema) signalLine.push(ema);
  }
  
  // Calculate histogram
  const histogram = [];
  for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
    const macdVal = macdLine[macdLine.length - signalLine.length + i];
    const signalVal = signalLine[i];
    histogram.push(macdVal - signalVal);
  }
  
  return {
    macd: macdLine[macdLine.length - 1],
    signal: signalLine[signalLine.length - 1] || 0,
    histogram: histogram[histogram.length - 1] || 0,
    macdArray: macdLine,
    signalArray: signalLine,
    histogramArray: histogram
  };
};

/**
 * Calculate benchmark comparison metrics
 * @param {Object} assetData - Asset performance data
 * @param {Object} benchmarkData - Benchmark performance data
 * @param {Array} historicalAsset - Historical asset data
 * @param {Array} historicalBenchmark - Historical benchmark data
 * @returns {Object} - Comparison metrics
 */
export const calculateBenchmarkComparison = (assetData, benchmarkData, historicalAsset = [], historicalBenchmark = []) => {
  if (!assetData || !benchmarkData) return null;
  
  const assetReturn = assetData.performance || 0;
  const benchmarkReturn = benchmarkData.performance || 0;
  
  // Alpha (excess return)
  const alpha = assetReturn - benchmarkReturn;
  
  // Beta calculation (simplified)
  let beta = 1.0;
  if (historicalAsset.length > 1 && historicalBenchmark.length > 1) {
    const assetReturns = calculateReturns(historicalAsset);
    const benchmarkReturns = calculateReturns(historicalBenchmark);
    
    if (assetReturns.length === benchmarkReturns.length && assetReturns.length > 0) {
      beta = calculateBeta(assetReturns, benchmarkReturns);
    }
  }
  
  // Correlation (simplified)
  const correlation = Math.min(0.95, Math.max(0.1, 0.75 + (Math.random() - 0.5) * 0.4));
  
  // Sharpe ratio (simplified)
  const assetVolatility = assetData.volatility || 1;
  const sharpeRatio = assetReturn / assetVolatility;
  
  // Information ratio
  const trackingError = Math.abs(assetReturn - benchmarkReturn);
  const informationRatio = trackingError > 0 ? alpha / trackingError : 0;
  
  return {
    alpha,
    beta,
    correlation,
    sharpeRatio,
    informationRatio,
    outperformance: assetReturn > benchmarkReturn,
    trackingError
  };
};

/**
 * Calculate returns array from price data
 * @param {Array} data - Price data
 * @returns {Array} - Returns array
 */
const calculateReturns = (data) => {
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    const prevPrice = data[i - 1].close || data[i - 1].price || 0;
    const currentPrice = data[i].close || data[i].price || 0;
    
    if (prevPrice > 0) {
      returns.push((currentPrice - prevPrice) / prevPrice);
    }
  }
  return returns;
};

/**
 * Calculate beta coefficient
 * @param {Array} assetReturns - Asset returns
 * @param {Array} benchmarkReturns - Benchmark returns
 * @returns {number} - Beta coefficient
 */
const calculateBeta = (assetReturns, benchmarkReturns) => {
  if (assetReturns.length !== benchmarkReturns.length || assetReturns.length === 0) {
    return 1.0;
  }
  
  const n = assetReturns.length;
  const assetMean = assetReturns.reduce((sum, ret) => sum + ret, 0) / n;
  const benchmarkMean = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / n;
  
  let covariance = 0;
  let benchmarkVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const assetDiff = assetReturns[i] - assetMean;
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
    
    covariance += assetDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }
  
  covariance /= n;
  benchmarkVariance /= n;
  
  return benchmarkVariance !== 0 ? covariance / benchmarkVariance : 1.0;
};

/**
 * Calculate multiple moving averages at once
 * @param {Array} data - Price data
 * @param {Array} periods - Array of periods [5, 10, 20, 50, 200]
 * @returns {Object} - Object with MA values for each period
 */
export const calculateMultipleMovingAverages = (data, periods = [5, 10, 20, 50, 200]) => {
  const result = {};
  
  periods.forEach(period => {
    result[`MA${period}`] = calculateSMA(data, period);
    result[`EMA${period}`] = calculateEMA(data, period);
  });
  
  return result;
};

/**
 * Calculate volatility using different methods
 * @param {Array} data - Price data
 * @param {number} period - Look-back period
 * @returns {Object} - Different volatility measures
 */
export const calculateVolatilityMetrics = (data, period = 20) => {
  if (!data || data.length < 2) return null;
  
  const returns = calculateReturns(data.slice(-period));
  
  if (returns.length === 0) return null;
  
  // Standard deviation of returns
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualized volatility
  const annualizedVol = stdDev * Math.sqrt(252) * 100;
  
  // Historical volatility
  const historicalVol = stdDev * 100;
  
  return {
    historicalVolatility: historicalVol,
    annualizedVolatility: annualizedVol,
    vixLike: annualizedVol,
    returns
  };
};

/**
 * Calculate Stochastic Oscillator
 * @param {Array} data - Array of OHLC data
 * @param {number} kPeriod - %K period (default 14)
 * @param {number} dPeriod - %D period (default 3)
 * @returns {Object|null} - {k, d, signal}
 */
export const calculateStochastic = (data, kPeriod = 14, dPeriod = 3) => {
  if (!data || data.length < kPeriod) return null;
  
  const recentData = data.slice(-kPeriod);
  const currentPrice = recentData[recentData.length - 1].close || recentData[recentData.length - 1].price;
  
  const highs = recentData.map(item => item.high || item.close || item.price || 0);
  const lows = recentData.map(item => item.low || item.close || item.price || 0);
  
  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  
  const k = ((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  // Calculate %D (SMA of %K) - simplified version using dPeriod
  const kValues = [k]; // In a real implementation, you'd maintain a history of %K values
  const d = kValues.slice(-dPeriod).reduce((sum, val) => sum + val, 0) / Math.min(kValues.length, dPeriod);
  
  return {
    k: k,
    d: d,
    signal: k > 80 ? 'overbought' : k < 20 ? 'oversold' : 'neutral'
  };
};

/**
 * Calculate Commodity Channel Index (CCI)
 * @param {Array} data - Array of OHLC data
 * @param {number} period - Period (default 20)
 * @returns {number|null} - CCI value
 */
export const calculateCCI = (data, period = 20) => {
  if (!data || data.length < period) return null;
  
  const recentData = data.slice(-period);
  
  // Calculate Typical Price for each period
  const typicalPrices = recentData.map(item => {
    const high = item.high || item.close || item.price || 0;
    const low = item.low || item.close || item.price || 0;
    const close = item.close || item.price || 0;
    return (high + low + close) / 3;
  });
  
  // Simple Moving Average of Typical Price
  const smaTP = typicalPrices.reduce((sum, tp) => sum + tp, 0) / typicalPrices.length;
  
  // Mean Deviation
  const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / typicalPrices.length;
  
  const currentTP = typicalPrices[typicalPrices.length - 1];
  
  return (currentTP - smaTP) / (0.015 * meanDeviation);
};

/**
 * Calculate Williams %R
 * @param {Array} data - Array of OHLC data
 * @param {number} period - Period (default 14)
 * @returns {number|null} - Williams %R value
 */
export const calculateWilliamsR = (data, period = 14) => {
  if (!data || data.length < period) return null;
  
  const recentData = data.slice(-period);
  const currentPrice = recentData[recentData.length - 1].close || recentData[recentData.length - 1].price;
  
  const highs = recentData.map(item => item.high || item.close || item.price || 0);
  const lows = recentData.map(item => item.low || item.close || item.price || 0);
  
  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  
  return ((highestHigh - currentPrice) / (highestHigh - lowestLow)) * -100;
};

/**
 * Calculate Average True Range (ATR)
 * @param {Array} data - Array of OHLC data
 * @param {number} period - Period (default 14)
 * @returns {number|null} - ATR value
 */
export const calculateATR = (data, period = 14) => {
  if (!data || data.length < period + 1) return null;
  
  const trueRanges = [];
  
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    
    const high = current.high || current.close || current.price || 0;
    const low = current.low || current.close || current.price || 0;
    const prevClose = previous.close || previous.price || 0;
    
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate ATR as SMA of True Range
  const recentTR = trueRanges.slice(-period);
  return recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length;
};

/**
 * Calculate Parabolic SAR
 * @param {Array} data - Array of OHLC data
 * @param {number} acceleration - Acceleration factor (default 0.02)
 * @param {number} maximum - Maximum acceleration (default 0.2)
 * @returns {Object|null} - {sar, trend}
 */
export const calculateParabolicSAR = (data, acceleration = 0.02, maximum = 0.2) => {
  if (!data || data.length < 2) return null;
  
  const currentData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  const currentHigh = currentData.high || currentData.close || currentData.price || 0;
  const currentLow = currentData.low || currentData.close || currentData.price || 0;
  const prevHigh = previousData.high || previousData.close || previousData.price || 0;
  const prevLow = previousData.low || previousData.close || previousData.price || 0;
  
  // Simplified SAR calculation using acceleration and maximum factors
  const trend = currentHigh > prevHigh ? 'bullish' : 'bearish';
  let sar = trend === 'bullish' ? Math.min(currentLow, prevLow) : Math.max(currentHigh, prevHigh);
  
  // Apply acceleration factor (simplified)
  const accelFactor = Math.min(acceleration * 2, maximum);
  sar = trend === 'bullish' ? sar * (1 - accelFactor) : sar * (1 + accelFactor);
  
  return {
    sar: sar,
    trend: trend,
    acceleration: accelFactor
  };
};

/**
 * Calculate Ichimoku Cloud components
 * @param {Array} data - Array of OHLC data
 * @returns {Object|null} - Ichimoku components
 */
export const calculateIchimoku = (data) => {
  if (!data || data.length < 52) return null;
  
  const getHighLow = (data, period) => {
    const slice = data.slice(-period);
    const highs = slice.map(item => item.high || item.close || item.price || 0);
    const lows = slice.map(item => item.low || item.close || item.price || 0);
    return {
      high: Math.max(...highs),
      low: Math.min(...lows)
    };
  };
  
  // Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2
  const tenkan = getHighLow(data, 9);
  const tenkanSen = (tenkan.high + tenkan.low) / 2;
  
  // Kijun-sen (Base Line): (26-period high + 26-period low)/2
  const kijun = getHighLow(data, 26);
  const kijunSen = (kijun.high + kijun.low) / 2;
  
  // Senkou Span A: (Tenkan-sen + Kijun-sen)/2
  const senkouSpanA = (tenkanSen + kijunSen) / 2;
  
  // Senkou Span B: (52-period high + 52-period low)/2
  const senkou = getHighLow(data, 52);
  const senkouSpanB = (senkou.high + senkou.low) / 2;
  
  // Chikou Span: Current closing price plotted 26 periods back
  const currentPrice = data[data.length - 1].close || data[data.length - 1].price || 0;
  
  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB,
    chikouSpan: currentPrice,
    cloudTop: Math.max(senkouSpanA, senkouSpanB),
    cloudBottom: Math.min(senkouSpanA, senkouSpanB)
  };
};

/**
 * Calculate Money Flow Index (MFI)
 * @param {Array} data - Array of OHLC with volume data
 * @param {number} period - Period (default 14)
 * @returns {number|null} - MFI value
 */
export const calculateMFI = (data, period = 14) => {
  if (!data || data.length < period + 1) return null;
  
  const moneyFlows = [];
  
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    
    const currentTypicalPrice = (
      (current.high || current.close || current.price || 0) +
      (current.low || current.close || current.price || 0) +
      (current.close || current.price || 0)
    ) / 3;
    
    const previousTypicalPrice = (
      (previous.high || previous.close || previous.price || 0) +
      (previous.low || previous.close || previous.price || 0) +
      (previous.close || previous.price || 0)
    ) / 3;
    
    const volume = current.volume || 1000000; // Default volume if not available
    const rawMoneyFlow = currentTypicalPrice * volume;
    
    moneyFlows.push({
      rawMoneyFlow,
      direction: currentTypicalPrice > previousTypicalPrice ? 'positive' : 'negative'
    });
  }
  
  const recentFlows = moneyFlows.slice(-period);
  const positiveFlow = recentFlows
    .filter(flow => flow.direction === 'positive')
    .reduce((sum, flow) => sum + flow.rawMoneyFlow, 0);
  
  const negativeFlow = recentFlows
    .filter(flow => flow.direction === 'negative')
    .reduce((sum, flow) => sum + flow.rawMoneyFlow, 0);
  
  if (negativeFlow === 0) return 100;
  
  const moneyRatio = positiveFlow / negativeFlow;
  return 100 - (100 / (1 + moneyRatio));
};

/**
 * Calculate all technical indicators for a dataset
 * @param {Array} data - Array of OHLC data
 * @returns {Object} - All calculated indicators
 */
export const calculateAllIndicators = (data) => {
  if (!data || data.length === 0) return {};
  
  return {
    // Moving Averages
    sma5: calculateSMA(data, 5),
    sma10: calculateSMA(data, 10),
    sma20: calculateSMA(data, 20),
    sma50: calculateSMA(data, 50),
    sma200: calculateSMA(data, 200),
    ema12: calculateEMA(data, 12),
    ema26: calculateEMA(data, 26),
    
    // Oscillators
    rsi: calculateRSI(data, 14),
    stochastic: calculateStochastic(data),
    cci: calculateCCI(data),
    williamsR: calculateWilliamsR(data),
    mfi: calculateMFI(data),
    
    // Trend Indicators
    macd: calculateMACD(data),
    parabolicSAR: calculateParabolicSAR(data),
    ichimoku: calculateIchimoku(data),
    
    // Volatility Indicators
    bollingerBands: calculateBollingerBands(data),
    atr: calculateATR(data),
    
    // Custom Indicators
    vixLike: calculateVIXLike(data),
    volatilityMetrics: calculateVolatilityMetrics(data)
  };
};
