import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import test functions and make them globally available
import websocketService from './services/websocketService.jsx';
import { fetchEnhancedMarketData } from './services/enhancedApiService.jsx';

// Make test functions available in browser console
if (typeof window !== 'undefined') {
  window.testImplementation = {
    websocketService,
    fetchEnhancedMarketData,
    
    async testAPI(symbol = 'BTC') {
      console.log(`🧪 Testing API for ${symbol}...`);
      try {
        const data = await fetchEnhancedMarketData(symbol);
        console.log(`✅ ${symbol} data:`, data);
        return data;
      } catch (error) {
        console.error(`❌ Error testing ${symbol}:`, error);
        return null;
      }
    },
    
    testWebSocket(symbol = 'BTCUSDT', exchange = 'binance') {
      console.log(`🧪 Testing WebSocket for ${symbol} on ${exchange}...`);
      
      const unsubscribe = websocketService.subscribeToTicker(
        symbol,
        (data) => {
          console.log(`📈 Live ${symbol}:`, {
            price: data.price,
            change: data.change24h,
            time: new Date(data.timestamp).toLocaleTimeString()
          });
        },
        exchange
      );
      
      console.log('🛑 WebSocket test will run for 30 seconds...');
      setTimeout(() => {
        unsubscribe();
        console.log('✅ WebSocket test completed');
      }, 30000);
      
      return unsubscribe;
    },
    
    getStatus() {
      return websocketService.getConnectionStatus();
    }
  };
  
  console.log('🔧 Test functions available!');
  console.log('📝 Try: window.testImplementation.testAPI("BTC")');
  console.log('📝 Try: window.testImplementation.testWebSocket("BTCUSDT")');
  console.log('📝 Try: window.testImplementation.getStatus()');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
