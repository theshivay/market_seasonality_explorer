import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  Wifi,
  WifiOff,
  Speed,
  ShowChart
} from '@mui/icons-material';
import { useOrderbook, useTicker, useWebSocketStatus } from '../hooks/useRealTimeData';

const RealTimeDataDashboard = ({ selectedInstrument, onToggleRealTime }) => {
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [selectedExchange] = useState('binance');
  const [showOrderbook, setShowOrderbook] = useState(true);
  
  // WebSocket status
  const wsStatus = useWebSocketStatus();
  
  // Real-time ticker data
  const ticker = useTicker(
    selectedInstrument?.symbol || 'BTCUSDT',
    selectedExchange,
    realtimeEnabled
  );
  
  // Real-time orderbook data
  const orderbook = useOrderbook(
    selectedInstrument?.symbol || 'BTCUSDT',
    selectedExchange,
    realtimeEnabled && showOrderbook
  );

  const handleToggleRealtime = (enabled) => {
    setRealtimeEnabled(enabled);
    if (onToggleRealTime) {
      onToggleRealTime(enabled);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  const formatChange = (change) => {
    if (!change) return '0.00%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.primary';
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Controls */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed color="primary" />
          Real-Time Market Data
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={realtimeEnabled}
              onChange={(e) => handleToggleRealtime(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Real-Time Updates"
        />
        
        <Chip
          icon={wsStatus.isConnected ? <Wifi /> : <WifiOff />}
          label={`${wsStatus.isConnected ? 'Connected' : 'Disconnected'} (${wsStatus.activeConnections} connections)`}
          color={wsStatus.isConnected ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Warning for crypto-only support */}
      {selectedInstrument?.assetType && selectedInstrument.assetType !== 'crypto' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Real-time data is currently available for cryptocurrencies only. 
          Other asset types show demo data.
        </Alert>
      )}

      {/* Real-Time Ticker */}
      {realtimeEnabled && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChart />
                    Live Price Ticker
                  </Typography>
                  {ticker.loading && <CircularProgress size={20} />}
                </Box>
                
                {ticker.error ? (
                  <Alert severity="error">{ticker.error}</Alert>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Price
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ${formatPrice(ticker.price)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        24h Change
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: getChangeColor(ticker.change24h),
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {ticker.change24h > 0 ? <TrendingUp /> : <TrendingDown />}
                        {formatChange(ticker.change24h)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        24h Volume
                      </Typography>
                      <Typography variant="h6">
                        {formatVolume(ticker.volume24h)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Exchange
                      </Typography>
                      <Chip 
                        label={ticker.exchange?.toUpperCase() || selectedExchange.toUpperCase()} 
                        size="small" 
                        color="primary"
                      />
                    </Grid>
                  </Grid>
                )}
                
                {ticker.timestamp && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Last updated: {new Date(ticker.timestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Orderbook Toggle */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    Order Book
                  </Typography>
                  <IconButton 
                    onClick={() => setShowOrderbook(!showOrderbook)}
                    size="small"
                  >
                    {showOrderbook ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                <Collapse in={showOrderbook}>
                  {orderbook.loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : orderbook.error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{orderbook.error}</Alert>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Price (USD)</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* Asks (Sell Orders) */}
                            {orderbook.asks.slice(0, 5).reverse().map((ask, index) => (
                              <TableRow key={`ask-${index}`} sx={{ backgroundColor: 'error.light', opacity: 0.7 }}>
                                <TableCell sx={{ color: 'error.dark', fontWeight: 'bold' }}>
                                  {formatPrice(ask.price)}
                                </TableCell>
                                <TableCell align="right">{formatVolume(ask.quantity)}</TableCell>
                                <TableCell align="right">{formatVolume(ask.price * ask.quantity)}</TableCell>
                              </TableRow>
                            ))}
                            
                            {/* Spread */}
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ backgroundColor: 'grey.100', fontWeight: 'bold' }}>
                                Spread: ${orderbook.asks[0] && orderbook.bids[0] ? 
                                  (orderbook.asks[0].price - orderbook.bids[0].price).toFixed(2) : '0.00'}
                              </TableCell>
                            </TableRow>
                            
                            {/* Bids (Buy Orders) */}
                            {orderbook.bids.slice(0, 5).map((bid, index) => (
                              <TableRow key={`bid-${index}`} sx={{ backgroundColor: 'success.light', opacity: 0.7 }}>
                                <TableCell sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                                  {formatPrice(bid.price)}
                                </TableCell>
                                <TableCell align="right">{formatVolume(bid.quantity)}</TableCell>
                                <TableCell align="right">{formatVolume(bid.price * bid.quantity)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      {orderbook.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Last updated: {new Date(orderbook.timestamp).toLocaleTimeString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Information Card */}
      {!realtimeEnabled && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-Time Data Features
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enable real-time updates to see:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">Live price ticker with 24h change and volume</Typography>
              <Typography component="li" variant="body2">Real-time order book data (top 10 bids/asks)</Typography>
              <Typography component="li" variant="body2">WebSocket connection status monitoring</Typography>
              <Typography component="li" variant="body2">Multiple exchange support (Binance, Coinbase, OKX)</Typography>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              Real-time data is currently supported for cryptocurrencies via WebSocket connections 
              to major exchanges. Other asset types will show historical and demo data.
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RealTimeDataDashboard;
