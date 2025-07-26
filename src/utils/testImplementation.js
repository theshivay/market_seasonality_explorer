/**
 * Test script to verify WebSocket and API functionality
 * This can be run in the browser console to test the implementations
 */

// Test the enhanced API service
export const testEnhancedAPI = async () => {
  console.log('🧪 Testing Enhanced API Service...');
  
  const { fetchEnhancedMarketData, ASSET_TYPES } = await import('./enhancedApiService');
  
  const testSymbols = [
    { symbol: 'BTC', type: ASSET_TYPES.CRYPTO },
    { symbol: 'AAPL', type: ASSET_TYPES.STOCK },
    { symbol: 'EURUSD', type: ASSET_TYPES.FOREX },
    { symbol: 'GOLD', type: ASSET_TYPES.COMMODITY },
    { symbol: 'SPX', type: ASSET_TYPES.INDEX }
  ];
  
  for (const test of testSymbols) {
    try {
      console.log(`📊 Testing ${test.symbol} (${test.type})...`);
      const data = await fetchEnhancedMarketData(test.symbol, test.type);
      console.log(`✅ ${test.symbol}:`, {
        price: data.currentPrice,
        assetType: data.assetType,
        dataSource: data.dataSource,
        dataPoints: data.dailyData?.length || 0
      });
    } catch (error) {
      console.error(`❌ Error testing ${test.symbol}:`, error);
    }
  }
};

// Test WebSocket functionality
export const testWebSocket = () => {
  console.log('🧪 Testing WebSocket Service...');
  
  import('./websocketService').then(({ default: websocketService }) => {
    const symbols = ['BTCUSDT', 'ETHUSDT'];
    const exchanges = ['binance'];
    
    symbols.forEach(symbol => {
      exchanges.forEach(exchange => {
        console.log(`📡 Testing WebSocket for ${symbol} on ${exchange}...`);
        
        // Test ticker subscription
        const unsubscribeTicker = websocketService.subscribeToTicker(
          symbol,
          (data) => {
            console.log(`📈 Ticker update for ${symbol}:`, {
              price: data.price,
              change24h: data.change24h,
              timestamp: new Date(data.timestamp).toLocaleTimeString()
            });
          },
          exchange
        );
        
        // Test orderbook subscription
        const unsubscribeOrderbook = websocketService.subscribeToOrderbook(
          symbol,
          (data) => {
            console.log(`📚 Orderbook update for ${symbol}:`, {
              topBid: data.bids[0]?.price,
              topAsk: data.asks[0]?.price,
              spread: data.asks[0]?.price - data.bids[0]?.price,
              timestamp: new Date(data.timestamp).toLocaleTimeString()
            });
          },
          exchange
        );
        
        // Clean up after 30 seconds
        setTimeout(() => {
          console.log(`🛑 Cleaning up ${symbol} subscriptions...`);
          unsubscribeTicker();
          unsubscribeOrderbook();
        }, 30000);
      });
    });
    
    // Monitor connection status
    const statusInterval = setInterval(() => {
      const status = websocketService.getConnectionStatus();
      console.log('📊 WebSocket Status:', status);
      
      if (!status.isConnected && status.activeConnections === 0) {
        clearInterval(statusInterval);
      }
    }, 5000);
  });
};

// Test real-time hooks (can be used in a React component)
export const testRealTimeHooks = () => {
  console.log('🧪 Testing Real-time Hooks...');
  console.log('ℹ️ Import and use these hooks in a React component:');
  console.log(`
import { useOrderbook, useTicker, useWebSocketStatus } from '../hooks/useRealTimeData';

// In your component:
const ticker = useTicker('BTCUSDT', 'binance', true);
const orderbook = useOrderbook('BTCUSDT', 'binance', true);
const wsStatus = useWebSocketStatus();

console.log('Ticker:', ticker);
console.log('Orderbook:', orderbook);
console.log('WS Status:', wsStatus);
  `);
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running All Implementation Tests...');
  
  await testEnhancedAPI();
  testWebSocket();
  testRealTimeHooks();
  
  console.log('✅ All tests initiated! Check console for results.');
};

// Make available in global scope for browser console testing
if (typeof window !== 'undefined') {
  window.testImplementation = {
    testEnhancedAPI,
    testWebSocket, 
    testRealTimeHooks,
    runAllTests
  };
  
  console.log('🔧 Test functions available in window.testImplementation');
  console.log('📝 Run window.testImplementation.runAllTests() to test everything');
}
