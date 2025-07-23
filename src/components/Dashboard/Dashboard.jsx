import React, { useContext, useState } from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  IconButton, 
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  styled,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  ShowChart,
  BarChart,
  AttachMoney
} from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from 'recharts';
import { AppContext } from '../../context/AppContext.jsx';
import useMarketData from '../../hooks/useMarketData.jsx';
import marketDataService from '../../services/marketDataService.jsx';
import { formatDate, formatNumber, formatPercentage } from '../../utils/dateUtils.jsx';
import moment from 'moment';

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

const DataQualityChip = styled(Box)(({ theme, quality }) => {
  const colors = {
    real: theme.palette.success.main,
    mock: theme.palette.warning.main,
    insufficient: theme.palette.error.main
  };
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    padding: '2px 6px',
    borderRadius: '16px',
    backgroundColor: colors[quality] || theme.palette.grey[500],
    color: '#fff',
    marginLeft: theme.spacing(1)
  };
});

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300,
  marginBottom: theme.spacing(3)
}));

const Dashboard = () => {
  const { 
    detailsOpen, 
    toggleDetailsPanel, 
    selectedDate,
    viewMode,
    selectedInstrument
  } = useContext(AppContext);
  
  const [tabIndex, setTabIndex] = useState(0);

  // Get date range for the selected date based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'daily':
        return {
          start: moment(selectedDate).startOf('day').valueOf(),
          end: moment(selectedDate).endOf('day').valueOf()
        };
      case 'weekly':
        return {
          start: moment(selectedDate).startOf('week').valueOf(),
          end: moment(selectedDate).endOf('week').valueOf()
        };
      case 'monthly':
        return {
          start: moment(selectedDate).startOf('month').valueOf(),
          end: moment(selectedDate).endOf('month').valueOf()
        };
      default:
        return {
          start: moment(selectedDate).startOf('day').valueOf(),
          end: moment(selectedDate).endOf('day').valueOf()
        };
    }
  };

  const { start, end } = getDateRange();

  // Fetch market data for the selected period
  const { data: marketData, loading } = useMarketData(
    selectedInstrument,
    viewMode,
    start,
    end
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Format dashboard title based on view mode
  const getDashboardTitle = () => {
    switch (viewMode) {
      case 'daily':
        return `Details for ${formatDate(selectedDate, 'MMMM D, YYYY')}`;
      case 'weekly':
        const weekStart = moment(selectedDate).startOf('week');
        const weekEnd = moment(selectedDate).endOf('week');
        return `Week of ${formatDate(weekStart, 'MMM D')} - ${formatDate(weekEnd, 'MMM D, YYYY')}`;
      case 'monthly':
        return `${formatDate(selectedDate, 'MMMM YYYY')} Overview`;
      default:
        return 'Market Data Details';
    }
  };

  const renderPriceChart = () => {
    if (loading || !marketData || !marketData.processed) {
      return (
        <ChartContainer>
          <Box sx={{ width: '100%', height: '100%' }}>
            {/* Chart skeleton */}
            <Skeleton variant="rectangular" width="100%" height="85%" />
            
            {/* X-axis labels skeleton */}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="text" width="15%" />
              ))}
            </Box>
            
            {/* Legend skeleton */}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
              <Skeleton variant="text" width="20%" />
            </Box>
          </Box>
        </ChartContainer>
      );
    }

    return (
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={marketData.processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              yAxisId="left"
              orientation="left" 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="close" 
              name="Price"
              stroke="#8884d8" 
              dot={false} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderVolumeChart = () => {
    if (loading || !marketData || !marketData.processed) {
      return <Typography>Loading volume data...</Typography>;
    }

    return (
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={marketData.processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
            />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="volume" 
              name="Volume" 
              fill="#82ca9d" 
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderVolatilityChart = () => {
    if (loading || !marketData || !marketData.processed) {
      return <Typography>Loading volatility data...</Typography>;
    }

    return (
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={marketData.processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
            />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="volatility"
              name="Volatility"
              stroke="#ff7300"
              fill="#ffa500"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderPerformanceChart = () => {
    if (loading || !marketData || !marketData.processed) {
      return <Typography>Loading performance data...</Typography>;
    }

    return (
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={marketData.processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="performance"
              name="Performance (%)"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderPriceTable = () => {
    if (loading || !marketData || !marketData.processed) {
      return <Typography>Loading price data...</Typography>;
    }

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell align="right">Open</TableCell>
              <TableCell align="right">High</TableCell>
              <TableCell align="right">Low</TableCell>
              <TableCell align="right">Close</TableCell>
              <TableCell align="right">Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketData.processed.map((row, index) => {
              const prevClose = index > 0 ? marketData.processed[index - 1].close : row.open;
              const change = row.close && prevClose ? ((row.close - prevClose) / prevClose) * 100 : null;
              
              return (
                <TableRow key={row.time} hover>
                  <TableCell>{row.formattedTime}</TableCell>
                  <TableCell align="right">{row.open ? formatNumber(row.open) : '-'}</TableCell>
                  <TableCell align="right">{row.high ? formatNumber(row.high) : '-'}</TableCell>
                  <TableCell align="right">{row.low ? formatNumber(row.low) : '-'}</TableCell>
                  <TableCell align="right">{row.close ? formatNumber(row.close) : '-'}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary'
                    }}
                  >
                    {change !== null ? formatPercentage(change) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderVolumeTable = () => {
    if (loading || !marketData || !marketData.processed) {
      return <Typography>Loading volume data...</Typography>;
    }

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell align="right">Volume</TableCell>
              <TableCell align="right">Number of Trades</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketData.processed.map((row) => (
              <TableRow key={row.time} hover>
                <TableCell>{row.formattedTime}</TableCell>
                <TableCell align="right">{formatNumber(row.volume, 0)}</TableCell>
                <TableCell align="right">{row.numberOfTrades?.toLocaleString() || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderMetricsTable = () => {
    if (loading || !marketData || !marketData.metrics) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {/* Volatility Metrics Skeleton */}
              <TableRow>
                <TableCell colSpan={2}>
                  <Skeleton variant="text" width="60%" height={30} />
                </TableCell>
              </TableRow>
              {[...Array(2)].map((_, i) => (
                <TableRow key={`vol-${i}`}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="40%" /></TableCell>
                </TableRow>
              ))}
              
              {/* Liquidity Metrics Skeleton */}
              <TableRow>
                <TableCell colSpan={2}>
                  <Skeleton variant="text" width="60%" height={30} sx={{ mt: 2 }} />
                </TableCell>
              </TableRow>
              {[...Array(4)].map((_, i) => (
                <TableRow key={`liq-${i}`}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="40%" /></TableCell>
                </TableRow>
              ))}
              
              {/* Performance Metrics Skeleton */}
              <TableRow>
                <TableCell colSpan={2}>
                  <Skeleton variant="text" width="60%" height={30} sx={{ mt: 2 }} />
                </TableCell>
              </TableRow>
              {[...Array(4)].map((_, i) => (
                <TableRow key={`perf-${i}`}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="40%" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    const { volatility, liquidity, performance } = marketData.metrics;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {/* Volatility Metrics */}
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Volatility Metrics</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Daily Volatility</TableCell>
              <TableCell align="right">
                {volatility ? formatPercentage(volatility.daily * 100, 2) : '-'}
                {volatility?.isEstimated && <span style={{fontSize: '0.8em', color: '#666'}}> (est.)</span>}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Annualized Volatility</TableCell>
              <TableCell align="right">
                {volatility ? formatPercentage(volatility.annualized * 100, 2) : '-'}
                {volatility?.isEstimated && <span style={{fontSize: '0.8em', color: '#666'}}> (est.)</span>}
              </TableCell>
            </TableRow>

            {/* Liquidity Metrics */}
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Liquidity Metrics</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bid-Ask Spread</TableCell>
              <TableCell align="right">{liquidity ? formatNumber(liquidity.spread) : '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Spread Percentage</TableCell>
              <TableCell align="right">{liquidity ? formatPercentage(liquidity.spreadPercentage) : '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Market Depth</TableCell>
              <TableCell align="right">{liquidity ? formatNumber(liquidity.totalDepth, 0) : '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Order Book Imbalance</TableCell>
              <TableCell align="right">{liquidity ? formatPercentage(liquidity.imbalance * 100) : '-'}</TableCell>
            </TableRow>

            {/* Performance Metrics */}
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>Performance Metrics</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Price Change</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: performance?.priceChange > 0 ? 'success.main' : 
                         performance?.priceChange < 0 ? 'error.main' : 'text.primary'
                }}
              >
                {performance ? formatNumber(performance.priceChange) : '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Change</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: performance?.priceChangePercentage > 0 ? 'success.main' : 
                         performance?.priceChangePercentage < 0 ? 'error.main' : 'text.primary'
                }}
              >
                {performance ? formatPercentage(performance.priceChangePercentage) : '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Highest Price</TableCell>
              <TableCell align="right">{performance ? formatNumber(performance.highestPrice) : '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Lowest Price</TableCell>
              <TableCell align="right">{performance ? formatNumber(performance.lowestPrice) : '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderTechnicalIndicators = () => {
    if (loading || !marketData || !marketData.historical) {
      return <Typography>Loading technical indicators...</Typography>;
    }
    
    // Calculate technical indicators using the enhanced service functions
    const rsiData = marketDataService.calculateRSI(marketData.historical);
    const macdData = marketDataService.calculateMACD(marketData.historical);
    const bbData = marketDataService.calculateBollingerBands(marketData.historical);
    
    // Calculate simple moving averages
    const calculateSMA = (data, period) => {
      if (!data || data.length < period) return null;
      const prices = data.map(d => d.close).slice(-period);
      const sum = prices.reduce((total, price) => total + price, 0);
      return sum / period;
    };
    
    const sma50 = calculateSMA(marketData.historical, 50);
    const sma200 = calculateSMA(marketData.historical, 200);
    
    // Define color indicators based on values
    const getRSIColor = (value) => {
      if (value >= 70) return 'error.main';  // Overbought
      if (value <= 30) return 'success.main'; // Oversold
      return 'text.primary'; // Neutral
    };
    
    const getMACDColor = (histogram) => {
      if (histogram > 0) return 'success.main'; // Positive momentum
      if (histogram < 0) return 'error.main';   // Negative momentum
      return 'text.primary'; // Neutral
    };
    
    // Format number for display with comma separators and proper decimals
    const formatIndicatorValue = (value) => {
      if (value === null || value === undefined) return 'N/A';
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    
    return (
      <List>
        <ListItem>
          <ListItemIcon><ShowChart /></ListItemIcon>
          <ListItemText 
            primary="Moving Averages" 
            secondary={
              <>
                <Typography component="span" variant="body2">
                  50-Day MA: {sma50 ? formatIndicatorValue(sma50) : 'N/A'}
                </Typography>
                <br />
                <Typography component="span" variant="body2">
                  200-Day MA: {sma200 ? formatIndicatorValue(sma200) : 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  {sma50 && sma200 ? 
                    sma50 > sma200 ? 
                      'Golden Cross (Bullish)' : 'Death Cross (Bearish)' 
                    : ''}
                </Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><ShowChart /></ListItemIcon>
          <ListItemText 
            primary="RSI (14)" 
            secondary={
              <>
                <Typography 
                  component="span" 
                  variant="body2" 
                  sx={{ color: getRSIColor(rsiData?.value) }}
                >
                  {rsiData ? formatIndicatorValue(rsiData.value) : 'N/A'} - {rsiData?.interpretation || 'N/A'}
                </Typography>
                {rsiData?.isEstimated && 
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    (Estimated - insufficient data)
                  </Typography>
                }
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><ShowChart /></ListItemIcon>
          <ListItemText 
            primary="MACD" 
            secondary={
              <>
                <Typography component="span" variant="body2">
                  MACD: {formatIndicatorValue(macdData.macd)}
                </Typography>
                <br />
                <Typography component="span" variant="body2">
                  Signal: {formatIndicatorValue(macdData.signal)}
                </Typography>
                <br />
                <Typography 
                  component="span" 
                  variant="body2" 
                  sx={{ color: getMACDColor(macdData.histogram) }}
                >
                  Histogram: {formatIndicatorValue(macdData.histogram)}
                  {macdData.histogram > 0 ? ' (Bullish)' : macdData.histogram < 0 ? ' (Bearish)' : ' (Neutral)'}
                </Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><ShowChart /></ListItemIcon>
          <ListItemText 
            primary="Bollinger Bands" 
            secondary={
              <>
                <Typography component="span" variant="body2">
                  Upper: {formatIndicatorValue(bbData.upper)}
                </Typography>
                <br />
                <Typography component="span" variant="body2">
                  Middle: {formatIndicatorValue(bbData.middle)}
                </Typography>
                <br />
                <Typography component="span" variant="body2">
                  Lower: {formatIndicatorValue(bbData.lower)}
                </Typography>
                <br />
                <Typography component="span" variant="body2">
                  Width: {formatIndicatorValue(bbData.width)}%
                </Typography>
                {bbData.isEstimated && 
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    (Estimated - insufficient data)
                  </Typography>
                }
              </>
            }
          />
        </ListItem>
      </List>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={detailsOpen}
      onClose={toggleDetailsPanel}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': { 
          width: { xs: '100%', sm: 400, md: 600 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        },
      }}
    >
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">{getDashboardTitle()}</Typography>
          {marketData && (
            <DataQualityChip quality={marketData.isMockData ? 'mock' : 'real'}>
              {marketData.isMockData ? 'Mock Data' : 'Real Data'}
            </DataQualityChip>
          )}
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={toggleDetailsPanel}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DrawerHeader>
      
      <Divider />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="dashboard tabs"
          >
            <Tab icon={<AttachMoney />} iconPosition="start" label="Price" />
            <Tab icon={<BarChart />} iconPosition="start" label="Volume" />
            <Tab icon={<TrendingUp />} iconPosition="start" label="Volatility" />
            <Tab icon={<ShowChart />} iconPosition="start" label="Metrics" />
            <Tab icon={<TrendingUp />} iconPosition="start" label="Technical" />
          </Tabs>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TabPanel value={tabIndex} index={0}>
            <Typography variant="h6" gutterBottom>Price Analysis</Typography>
            {renderPriceChart()}
            {renderPriceTable()}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={1}>
            <Typography variant="h6" gutterBottom>Volume Analysis</Typography>
            {renderVolumeChart()}
            {renderVolumeTable()}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={2}>
            <Typography variant="h6" gutterBottom>Volatility Analysis</Typography>
            {renderVolatilityChart()}
            {renderPerformanceChart()}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={3}>
            <Typography variant="h6" gutterBottom>Market Metrics</Typography>
            {renderMetricsTable()}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={4}>
            <Typography variant="h6" gutterBottom>Technical Indicators</Typography>
            {renderTechnicalIndicators()}
          </TabPanel>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Dashboard;
