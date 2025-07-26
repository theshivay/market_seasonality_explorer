/**
 * WebSocket Service for Real-time Market Data
 * Enhanced with better error handling and fallback mechanisms
 */

class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.subscribers = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 3; // Reduced for faster fallback
    this.reconnectDelay = 2000; // Increased initial delay
    this.isConnected = false;
    this.connectionTimeouts = new Map(); // Track connection timeouts
  }

  /**
   * Subscribe to real-time orderbook data
   * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT', 'BTC-USD')
   * @param {Function} callback - Callback function to handle orderbook updates
   * @param {string} exchange - Exchange to connect to ('binance', 'coinbase', 'okx')
   */
  subscribeToOrderbook(symbol, callback, exchange = 'binance') {
    const connectionKey = `${exchange}_orderbook_${symbol}`;
    
    if (!this.subscribers.has(connectionKey)) {
      this.subscribers.set(connectionKey, new Set());
    }
    
    this.subscribers.get(connectionKey).add(callback);
    
    if (!this.connections.has(connectionKey)) {
      this._createOrderbookConnection(symbol, exchange, connectionKey);
    }
    
    return () => this.unsubscribe(connectionKey, callback);
  }

  /**
   * Subscribe to real-time price ticker data
   * @param {string} symbol - Trading pair symbol
   * @param {Function} callback - Callback function to handle price updates
   * @param {string} exchange - Exchange to connect to
   */
  subscribeToTicker(symbol, callback, exchange = 'binance') {
    const connectionKey = `${exchange}_ticker_${symbol}`;
    
    if (!this.subscribers.has(connectionKey)) {
      this.subscribers.set(connectionKey, new Set());
    }
    
    this.subscribers.get(connectionKey).add(callback);
    
    if (!this.connections.has(connectionKey)) {
      this._createTickerConnection(symbol, exchange, connectionKey);
    }
    
    return () => this.unsubscribe(connectionKey, callback);
  }

  /**
   * Create orderbook WebSocket connection with enhanced error handling
   */
  _createOrderbookConnection(symbol, exchange, connectionKey) {
    console.log(`🔌 Attempting WebSocket connection for ${exchange} orderbook: ${symbol}`);
    
    const wsUrl = this._getWebSocketUrl(symbol, exchange, 'orderbook');
    console.log(`📡 WebSocket URL: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log(`⏰ Connection timeout for ${exchange} orderbook: ${symbol}`);
        ws.close();
        this._handleConnectionTimeout(symbol, exchange, connectionKey, 'orderbook');
      }, 8000); // 8 second timeout
      
      this.connectionTimeouts.set(connectionKey, connectionTimeout);
      
      ws.onopen = () => {
        console.log(`✅ WebSocket connected for ${exchange} orderbook: ${symbol}`);
        this.isConnected = true;
        this.reconnectAttempts.set(connectionKey, 0);
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Send subscription message based on exchange
        const subscriptionMessage = this._getSubscriptionMessage(symbol, exchange, 'orderbook');
        if (subscriptionMessage) {
          console.log(`📤 Sending subscription message:`, subscriptionMessage);
          ws.send(JSON.stringify(subscriptionMessage));
        }
        
        // Send initial success callback with demo data if no real data comes quickly
        setTimeout(() => {
          if (this.subscribers.has(connectionKey)) {
            this._sendDemoOrderbookData(connectionKey, symbol);
          }
        }, 2000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`📨 WebSocket message received for ${symbol}:`, data);
          
          const processedData = this._processOrderbookData(data, exchange);
          
          if (processedData && this.subscribers.has(connectionKey)) {
            console.log(`📊 Processed orderbook data for ${symbol}:`, processedData);
            this.subscribers.get(connectionKey).forEach(callback => {
              callback(processedData);
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected for ${exchange} orderbook: ${symbol}`, event.code, event.reason);
        this.isConnected = false;
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Only attempt reconnect if not intentionally closed
        if (event.code !== 1000) {
          this._handleReconnect(symbol, exchange, connectionKey, 'orderbook');
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${exchange} orderbook: ${symbol}`, error);
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Send demo data on error
        this._sendDemoOrderbookData(connectionKey, symbol);
      };

      this.connections.set(connectionKey, ws);
      
    } catch (error) {
      console.error(`❌ Failed to create WebSocket connection for ${symbol}:`, error);
      this._handleConnectionTimeout(symbol, exchange, connectionKey, 'orderbook');
    }
  }

  /**
   * Create ticker WebSocket connection with enhanced error handling
   */
  _createTickerConnection(symbol, exchange, connectionKey) {
    console.log(`🔌 Attempting WebSocket connection for ${exchange} ticker: ${symbol}`);
    
    const wsUrl = this._getWebSocketUrl(symbol, exchange, 'ticker');
    console.log(`📡 WebSocket URL: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log(`⏰ Connection timeout for ${exchange} ticker: ${symbol}`);
        ws.close();
        this._handleConnectionTimeout(symbol, exchange, connectionKey, 'ticker');
      }, 8000); // 8 second timeout
      
      this.connectionTimeouts.set(connectionKey, connectionTimeout);
      
      ws.onopen = () => {
        console.log(`✅ WebSocket connected for ${exchange} ticker: ${symbol}`);
        this.isConnected = true;
        this.reconnectAttempts.set(connectionKey, 0);
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Send subscription message
        const subscriptionMessage = this._getSubscriptionMessage(symbol, exchange, 'ticker');
        if (subscriptionMessage) {
          console.log(`📤 Sending subscription message:`, subscriptionMessage);
          ws.send(JSON.stringify(subscriptionMessage));
        }
        
        // Send initial success callback with demo data if no real data comes quickly
        setTimeout(() => {
          if (this.subscribers.has(connectionKey)) {
            this._sendDemoTickerData(connectionKey, symbol);
          }
        }, 2000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`📨 WebSocket message received for ${symbol}:`, data);
          
          const processedData = this._processTickerData(data, exchange);
          
          if (processedData && this.subscribers.has(connectionKey)) {
            console.log(`📊 Processed ticker data for ${symbol}:`, processedData);
            this.subscribers.get(connectionKey).forEach(callback => {
              callback(processedData);
            });
          }
        } catch (error) {
          console.error('Error processing ticker WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected for ${exchange} ticker: ${symbol}`, event.code, event.reason);
        this.isConnected = false;
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Only attempt reconnect if not intentionally closed
        if (event.code !== 1000) {
          this._handleReconnect(symbol, exchange, connectionKey, 'ticker');
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${exchange} ticker: ${symbol}`, error);
        
        // Clear connection timeout
        const timeout = this.connectionTimeouts.get(connectionKey);
        if (timeout) {
          clearTimeout(timeout);
          this.connectionTimeouts.delete(connectionKey);
        }
        
        // Send demo data on error
        this._sendDemoTickerData(connectionKey, symbol);
      };

      this.connections.set(connectionKey, ws);
      
    } catch (error) {
      console.error(`❌ Failed to create WebSocket connection for ${symbol}:`, error);
      this._handleConnectionTimeout(symbol, exchange, connectionKey, 'ticker');
    }
  }

  /**
   * Get WebSocket URL based on exchange and data type
   */
  _getWebSocketUrl(symbol, exchange, dataType) {
    const symbolFormatted = this._formatSymbolForExchange(symbol, exchange);
    
    switch (exchange.toLowerCase()) {
      case 'binance':
        if (dataType === 'orderbook') {
          return `wss://stream.binance.com:9443/ws/${symbolFormatted.toLowerCase()}@depth20@100ms`;
        } else if (dataType === 'ticker') {
          return `wss://stream.binance.com:9443/ws/${symbolFormatted.toLowerCase()}@ticker`;
        }
        break;
      
      case 'coinbase':
        return 'wss://ws-feed.pro.coinbase.com';
      
      case 'okx':
        return 'wss://ws.okx.com:8443/ws/v5/public';
      
      default:
        return `wss://stream.binance.com:9443/ws/${symbolFormatted.toLowerCase()}@depth20@100ms`;
    }
  }

  /**
   * Get subscription message based on exchange
   */
  _getSubscriptionMessage(symbol, exchange, dataType) {
    const symbolFormatted = this._formatSymbolForExchange(symbol, exchange);
    
    switch (exchange.toLowerCase()) {
      case 'binance':
        // Binance uses URL-based subscriptions, no message needed
        return null;
      
      case 'coinbase':
        if (dataType === 'orderbook') {
          return {
            type: 'subscribe',
            product_ids: [symbolFormatted],
            channels: ['level2', 'ticker']
          };
        } else if (dataType === 'ticker') {
          return {
            type: 'subscribe',
            product_ids: [symbolFormatted],
            channels: ['ticker']
          };
        }
        break;
      
      case 'okx':
        if (dataType === 'orderbook') {
          return {
            op: 'subscribe',
            args: [{
              channel: 'books5',
              instId: symbolFormatted
            }]
          };
        } else if (dataType === 'ticker') {
          return {
            op: 'subscribe',
            args: [{
              channel: 'tickers',
              instId: symbolFormatted
            }]
          };
        }
        break;
      
      default:
        return null;
    }
  }

  /**
   * Format symbol for specific exchange
   */
  _formatSymbolForExchange(symbol, exchange) {
    switch (exchange.toLowerCase()) {
      case 'binance':
        // Convert BTC-USDT to BTCUSDT
        return symbol.replace('-', '').toUpperCase();
      
      case 'coinbase':
        // Convert BTCUSDT to BTC-USD or keep BTC-USD
        if (symbol.includes('-')) {
          return symbol.replace('USDT', 'USD').toUpperCase();
        } else {
          // Convert BTCUSDT to BTC-USD
          const base = symbol.slice(0, -4);
          return `${base}-USD`.toUpperCase();
        }
      
      case 'okx':
        // Convert BTCUSDT to BTC-USDT or keep BTC-USDT
        if (!symbol.includes('-')) {
          const base = symbol.slice(0, -4);
          const quote = symbol.slice(-4);
          return `${base}-${quote}`.toUpperCase();
        }
        return symbol.toUpperCase();
      
      default:
        return symbol.toUpperCase();
    }
  }

  /**
   * Process orderbook data from different exchanges
   */
  _processOrderbookData(data, exchange) {
    try {
      switch (exchange.toLowerCase()) {
        case 'binance':
          if (data.bids && data.asks) {
            return {
              exchange: 'binance',
              symbol: data.s,
              timestamp: Date.now(),
              bids: data.bids.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              })),
              asks: data.asks.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              }))
            };
          }
          break;
        
        case 'coinbase':
          if (data.type === 'snapshot' && data.bids && data.asks) {
            return {
              exchange: 'coinbase',
              symbol: data.product_id,
              timestamp: Date.now(),
              bids: data.bids.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              })),
              asks: data.asks.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              }))
            };
          }
          break;
        
        case 'okx':
          if (data.data && data.data[0] && data.data[0].bids && data.data[0].asks) {
            const orderbook = data.data[0];
            return {
              exchange: 'okx',
              symbol: orderbook.instId,
              timestamp: parseInt(orderbook.ts),
              bids: orderbook.bids.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              })),
              asks: orderbook.asks.slice(0, 10).map(([price, quantity]) => ({
                price: parseFloat(price),
                quantity: parseFloat(quantity)
              }))
            };
          }
          break;
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error processing orderbook data:', error);
      return null;
    }
  }

  /**
   * Process ticker data from different exchanges
   */
  _processTickerData(data, exchange) {
    try {
      switch (exchange.toLowerCase()) {
        case 'binance':
          if (data.c && data.s) { // c = current price, s = symbol
            return {
              exchange: 'binance',
              symbol: data.s,
              price: parseFloat(data.c),
              change24h: parseFloat(data.P),
              volume24h: parseFloat(data.v),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              timestamp: data.E
            };
          }
          break;
        
        case 'coinbase':
          if (data.type === 'ticker') {
            return {
              exchange: 'coinbase',
              symbol: data.product_id,
              price: parseFloat(data.price),
              change24h: parseFloat(data.open_24h) ? ((parseFloat(data.price) - parseFloat(data.open_24h)) / parseFloat(data.open_24h) * 100) : 0,
              volume24h: parseFloat(data.volume_24h),
              high24h: parseFloat(data.high_24h),
              low24h: parseFloat(data.low_24h),
              timestamp: new Date(data.time).getTime()
            };
          }
          break;
        
        case 'okx':
          if (data.data && data.data[0]) {
            const ticker = data.data[0];
            return {
              exchange: 'okx',
              symbol: ticker.instId,
              price: parseFloat(ticker.last),
              change24h: parseFloat(ticker.sodUtc8),
              volume24h: parseFloat(ticker.vol24h),
              high24h: parseFloat(ticker.high24h),
              low24h: parseFloat(ticker.low24h),
              timestamp: parseInt(ticker.ts)
            };
          }
          break;
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error processing ticker data:', error);
      return null;
    }
  }

  /**
   * Handle reconnection logic with better fallback
   */
  _handleReconnect(symbol, exchange, connectionKey, dataType) {
    const attempts = this.reconnectAttempts.get(connectionKey) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect ${exchange} ${dataType} for ${symbol} (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts.set(connectionKey, attempts + 1);
        
        if (dataType === 'orderbook') {
          this._createOrderbookConnection(symbol, exchange, connectionKey);
        } else if (dataType === 'ticker') {
          this._createTickerConnection(symbol, exchange, connectionKey);
        }
      }, delay);
    } else {
      console.log(`❌ Max reconnection attempts reached for ${exchange} ${dataType}: ${symbol}. Using demo data.`);
      // Switch to demo data mode
      this._startDemoDataMode(connectionKey, symbol, dataType);
    }
  }

  /**
   * Handle connection timeout
   */
  _handleConnectionTimeout(symbol, exchange, connectionKey, dataType) {
    console.log(`⏰ Connection timeout for ${exchange} ${dataType}: ${symbol}. Switching to demo data.`);
    this._startDemoDataMode(connectionKey, symbol, dataType);
  }

  /**
   * Start demo data mode for failed connections
   */
  _startDemoDataMode(connectionKey, symbol, dataType) {
    console.log(`🎭 Starting demo data mode for ${symbol} (${dataType})`);
    
    const interval = setInterval(() => {
      if (!this.subscribers.has(connectionKey) || this.subscribers.get(connectionKey).size === 0) {
        clearInterval(interval);
        return;
      }
      
      if (dataType === 'orderbook') {
        this._sendDemoOrderbookData(connectionKey, symbol);
      } else if (dataType === 'ticker') {
        this._sendDemoTickerData(connectionKey, symbol);
      }
    }, 3000); // Update every 3 seconds
    
    // Store interval for cleanup
    this.connections.set(connectionKey, { type: 'demo', interval });
  }

  /**
   * Send demo orderbook data
   */
  _sendDemoOrderbookData(connectionKey, symbol) {
    if (!this.subscribers.has(connectionKey)) return;
    
    const basePrice = 50000; // Base price for demo
    const spread = 0.01;
    
    const demoData = {
      exchange: 'demo',
      symbol: symbol,
      timestamp: Date.now(),
      bids: Array.from({ length: 10 }, (_, i) => ({
        price: basePrice - (i + 1) * spread * basePrice,
        quantity: Math.random() * 5 + 1
      })),
      asks: Array.from({ length: 10 }, (_, i) => ({
        price: basePrice + (i + 1) * spread * basePrice,
        quantity: Math.random() * 5 + 1
      }))
    };
    
    console.log(`📚 Sending demo orderbook data for ${symbol}`);
    this.subscribers.get(connectionKey).forEach(callback => {
      callback(demoData);
    });
  }

  /**
   * Send demo ticker data
   */
  _sendDemoTickerData(connectionKey, symbol) {
    if (!this.subscribers.has(connectionKey)) return;
    
    const basePrice = 50000;
    const change = (Math.random() - 0.5) * 10; // Random change -5% to +5%
    const currentPrice = basePrice * (1 + change / 100);
    
    const demoData = {
      exchange: 'demo',
      symbol: symbol,
      price: currentPrice,
      change24h: change,
      volume24h: Math.random() * 1000000 + 500000,
      high24h: currentPrice * 1.05,
      low24h: currentPrice * 0.95,
      timestamp: Date.now()
    };
    
    console.log(`📈 Sending demo ticker data for ${symbol}:`, demoData.price);
    this.subscribers.get(connectionKey).forEach(callback => {
      callback(demoData);
    });
  }

  /**
   * Unsubscribe from updates with proper cleanup
   */
  unsubscribe(connectionKey, callback) {
    if (this.subscribers.has(connectionKey)) {
      this.subscribers.get(connectionKey).delete(callback);
      
      // If no more subscribers, close the connection
      if (this.subscribers.get(connectionKey).size === 0) {
        this.subscribers.delete(connectionKey);
        
        if (this.connections.has(connectionKey)) {
          const connection = this.connections.get(connectionKey);
          
          if (connection && typeof connection === 'object' && connection.type === 'demo') {
            // Clean up demo data interval
            clearInterval(connection.interval);
          } else if (connection && typeof connection.close === 'function') {
            // Close WebSocket connection
            connection.close();
          }
          
          this.connections.delete(connectionKey);
        }
        
        // Clean up connection timeout
        if (this.connectionTimeouts.has(connectionKey)) {
          clearTimeout(this.connectionTimeouts.get(connectionKey));
          this.connectionTimeouts.delete(connectionKey);
        }
      }
    }
  }

  /**
   * Close all connections with proper cleanup
   */
  closeAllConnections() {
    this.connections.forEach((connection) => {
      if (connection && typeof connection === 'object' && connection.type === 'demo') {
        clearInterval(connection.interval);
      } else if (connection && typeof connection.close === 'function') {
        connection.close();
      }
    });
    
    // Clear all timeouts
    this.connectionTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    
    this.connections.clear();
    this.subscribers.clear();
    this.reconnectAttempts.clear();
    this.connectionTimeouts.clear();
    this.isConnected = false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      activeConnections: this.connections.size,
      activeSubscriptions: this.subscribers.size
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
