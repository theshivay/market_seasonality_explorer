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
  Collapse,
  useTheme
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
  const theme = useTheme();
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
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Professional Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' }, 
          justifyContent: 'space-between',
          gap: 3,
        }}>
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                fontWeight: 600,
                mb: 1,
              }}
            >
              <Speed color="primary" />
              Real-Time Market Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live market data feeds with professional-grade analytics
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap',
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={realtimeEnabled}
                  onChange={(e) => handleToggleRealtime(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4CAF50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4CAF50',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  Enable Real-Time Updates
                </Typography>
              }
            />
            
            <Chip
              icon={wsStatus.isConnected ? <Wifi /> : <WifiOff />}
              label={`${wsStatus.isConnected ? 'Connected' : 'Disconnected'} (${wsStatus.activeConnections})`}
              color={wsStatus.isConnected ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 500,
                '& .MuiChip-icon': {
                  fontSize: '1rem',
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Asset Type Warning */}
      {selectedInstrument?.assetType && selectedInstrument.assetType !== 'crypto' && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
            },
          }}
        >
          Real-time data is currently available for cryptocurrencies only. 
          Other asset types show demo data.
        </Alert>
      )}

      {/* Real-Time Content */}
      {realtimeEnabled ? (
        <Grid container spacing={3}>
          {/* Live Price Ticker - Professional Card */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 3 
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    <ShowChart color="primary" />
                    Live Price Ticker
                    <Chip 
                      label={ticker.exchange?.toUpperCase() || selectedExchange.toUpperCase()} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Typography>
                  {ticker.loading && <CircularProgress size={20} />}
                </Box>
                
                {ticker.error ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>{ticker.error}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {/* Current Price */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Current Price
                        </Typography>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            color: theme.palette.text.primary,
                          }}
                        >
                          ${formatPrice(ticker.price)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* 24h Change */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: theme.palette.action.hover,
                        border: `1px solid ${ticker.change24h > 0 ? 'success.main' : 'error.main'}`,
                        borderLeft: `4px solid ${ticker.change24h > 0 ? 'success.main' : 'error.main'}`,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: ticker.change24h > 0 ? 'success.light' : 'error.light',
                          opacity: 0.1,
                          borderRadius: 2,
                          zIndex: 0,
                        },
                        '& > *': {
                          position: 'relative',
                          zIndex: 1,
                        },
                      }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          24h Change
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: getChangeColor(ticker.change24h),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                          }}
                        >
                          {ticker.change24h > 0 ? <TrendingUp /> : <TrendingDown />}
                          {formatChange(ticker.change24h)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Volume and Additional Stats */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              24h Volume
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {formatVolume(ticker.volume24h)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Exchange
                            </Typography>
                            <Chip 
                              label={ticker.exchange?.toUpperCase() || selectedExchange.toUpperCase()} 
                              size="small" 
                              color="primary"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Last Updated
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {ticker.timestamp ? new Date(ticker.timestamp).toLocaleTimeString() : 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Book - Professional Table */}
          <Grid item xs={12} lg={4}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                height: 'fit-content',
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}>
                  <Typography variant="h6" fontWeight={600}>
                    Order Book
                  </Typography>
                  <IconButton 
                    onClick={() => setShowOrderbook(!showOrderbook)}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.action.hover,
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                      },
                    }}
                  >
                    {showOrderbook ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                <Collapse in={showOrderbook}>
                  {orderbook.loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : orderbook.error ? (
                    <Box sx={{ p: 3 }}>
                      <Alert severity="error">{orderbook.error}</Alert>
                    </Box>
                  ) : (
                    <Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                              <TableCell sx={{ fontWeight: 600 }}>Price (USD)</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {/* Asks (Sell Orders) */}
                            {orderbook.asks.slice(0, 5).reverse().map((ask, index) => (
                              <TableRow 
                                key={`ask-${index}`} 
                                sx={{ 
                                  backgroundColor: 'error.light',
                                  opacity: 0.8,
                                  '&:hover': {
                                    opacity: 1,
                                    backgroundColor: 'error.light',
                                  },
                                }}
                              >
                                <TableCell sx={{ color: 'error.dark', fontWeight: 'bold' }}>
                                  {formatPrice(ask.price)}
                                </TableCell>
                                <TableCell align="right">{formatVolume(ask.quantity)}</TableCell>
                                <TableCell align="right">{formatVolume(ask.price * ask.quantity)}</TableCell>
                              </TableRow>
                            ))}
                            
                            {/* Spread */}
                            <TableRow>
                              <TableCell 
                                colSpan={3} 
                                align="center" 
                                sx={{ 
                                  backgroundColor: theme.palette.action.selected,
                                  fontWeight: 'bold',
                                  borderTop: `2px solid ${theme.palette.divider}`,
                                  borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                              >
                                Spread: ${orderbook.asks[0] && orderbook.bids[0] ? 
                                  (orderbook.asks[0].price - orderbook.bids[0].price).toFixed(2) : '0.00'}
                              </TableCell>
                            </TableRow>
                            
                            {/* Bids (Buy Orders) */}
                            {orderbook.bids.slice(0, 5).map((bid, index) => (
                              <TableRow 
                                key={`bid-${index}`} 
                                sx={{ 
                                  backgroundColor: 'success.light',
                                  opacity: 0.8,
                                  '&:hover': {
                                    opacity: 1,
                                    backgroundColor: 'success.light',
                                  },
                                }}
                              >
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
                        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="caption" color="text.secondary">
                            Last updated: {new Date(orderbook.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* Information Card - Professional Design */
        <Card 
          elevation={2}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Real-Time Data Features
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enable real-time updates to access professional market data:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                  <ShowChart color="primary" />
                  <Typography variant="body2">Live price ticker with 24h metrics</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                  <Speed color="primary" />
                  <Typography variant="body2">Real-time order book data</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                  <Wifi color="primary" />
                  <Typography variant="body2">WebSocket connection monitoring</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                  <TrendingUp color="primary" />
                  <Typography variant="body2">Multiple exchange support</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem',
                },
              }}
            >
              Real-time data is currently supported for cryptocurrencies via WebSocket connections 
              to major exchanges (Binance, Coinbase, OKX). Other asset types display historical and demo data.
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RealTimeDataDashboard;
