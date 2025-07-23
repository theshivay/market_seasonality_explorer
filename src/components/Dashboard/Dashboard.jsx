import React, { useState, useEffect } from 'react';
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
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ShowChart,
  BarChart as BarChartIcon,
  AttachMoney,
  CalendarMonth,
  CompareArrows,
  FileDownload,
  PriceCheck,
  Autorenew,
  Bolt
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  Scatter,
  ScatterChart,
  ZAxis 
} from 'recharts';
import useMarketData from '../../hooks/useMarketData';
import marketDataService from '../../services/marketDataService';
import { formatDate, formatNumber, formatPercentage, formatPrice } from '../../utils/dateUtils';
import moment from 'moment';

// Dashboard tabs
const TABS = {
  OVERVIEW: 0,
  PRICE: 1,
  VOLATILITY: 2,
  VOLUME: 3,
  TECHNICAL: 4
};

// Custom tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

// Helper function to get trend icon
const getTrendIcon = (value, theme) => {
  if (value > 0) {
    return <TrendingUp sx={{ color: theme.palette.success.main }} />;
  }
  if (value < 0) {
    return <TrendingDown sx={{ color: theme.palette.error.main }} />;
  }
  return <TrendingFlat sx={{ color: theme.palette.text.secondary }} />;
};

// Helper function to get trend color
const getTrendColor = (value, theme) => {
  if (value > 0) return theme.palette.success.main;
  if (value < 0) return theme.palette.error.main;
  return theme.palette.text.secondary;
};

const Dashboard = ({ open, onClose, selectedDate, instrument, useRealData }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [historicalData, setHistoricalData] = useState([]);
  const [timeRange, setTimeRange] = useState('1W'); // Options: 1D, 1W, 1M, 3M
  const [expandedView, setExpandedView] = useState(false);
  const { data, loading } = useMarketData(selectedDate, instrument, useRealData);
  
  // Generate historical data for charts
  useEffect(() => {
    if (selectedDate) {
      let startDate;
      
      switch(timeRange) {
        case '1D':
          // For intraday, we use the selected date
          startDate = moment(selectedDate);
          break;
        case '1W':
          startDate = moment(selectedDate).subtract(7, 'days');
          break;
        case '1M':
          startDate = moment(selectedDate).subtract(30, 'days');
          break;
        case '3M':
          startDate = moment(selectedDate).subtract(90, 'days');
          break;
        default:
          startDate = moment(selectedDate).subtract(7, 'days');
      }
      
      const endDate = moment(selectedDate);
      
      const dates = [];
      let currentDate = startDate.clone();
      
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        dates.push(currentDate.clone());
        currentDate.add(1, 'day');
      }
      
      const histData = dates.map(date => marketDataService.getHistoricalData(date, instrument, useRealData))
        .filter(data => data && data.isMarketOpen);
      
      setHistoricalData(histData);
    }
  }, [selectedDate, instrument, timeRange]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  if (!selectedDate) return null;

  // Format data for price chart
  const getPriceChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(day => ({
      date: day.date,
      open: day.price * 0.99,  // Simulate OHLC data
      high: day.price * 1.03,
      low: day.price * 0.97,
      close: day.price,
      formattedDate: moment(day.date).format('MMM D')
    }));
  };
  
  // Format data for volume chart
  const getVolumeChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(day => ({
      date: day.date,
      volume: day.volume,
      formattedDate: moment(day.date).format('MMM D')
    }));
  };
  
  // Format data for volatility chart
  const getVolatilityChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(day => ({
      date: day.date,
      volatility: day.volatility,
      formattedDate: moment(day.date).format('MMM D')
    }));
  };
  
  // Format intraday data
  const getIntradayData = () => {
    if (!data || !data.intradayData) return [];
    
    return data.intradayData || Array.from({length: 8}, (_, i) => ({
      hour: `${9 + i}:00`,
      price: data.price * (1 + (Math.random() - 0.5) * 0.02),
      volume: data.volume * (Math.random() * 0.5 + 0.5)
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: expandedView ? '90%' : '80%', 
          maxWidth: '1200px',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {instrument?.name || instrument || 'Market Data'}
            </Typography>
            <Typography variant="subtitle2">
              {selectedDate ? moment(selectedDate).format('dddd, MMMM D, YYYY') : 'Select a date'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Export Data">
              <IconButton 
                size="small" 
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <FileDownload />
              </IconButton>
            </Tooltip>
            <IconButton 
              onClick={onClose}
              sx={{ color: theme.palette.primary.contrastText }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
        
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab icon={<ShowChart />} iconPosition="start" label="Overview" value={TABS.OVERVIEW} />
          <Tab icon={<PriceCheck />} iconPosition="start" label="Price Analysis" value={TABS.PRICE} />
          <Tab icon={<Bolt />} iconPosition="start" label="Volatility" value={TABS.VOLATILITY} />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Volume" value={TABS.VOLUME} />
          <Tab icon={<Autorenew />} iconPosition="start" label="Technical" value={TABS.TECHNICAL} />
        </Tabs>
        
        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item}>
                    <Skeleton variant="rectangular" height={120} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={300} />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <>
              {data?.isMarketOpen ? (
                <>
                  {/* Overview Tab */}
                  <TabPanel value={activeTab} index={TABS.OVERVIEW}>
                    <Box sx={{ p: 3 }}>
                      {/* Summary Cards */}
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Price Card */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Card elevation={2}>
                            <CardContent>
                              <Typography color="textSecondary" gutterBottom variant="overline">
                                Current Price
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" component="div">
                                  {formatPrice(data.price, instrument)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getTrendIcon(data.priceChange, theme)}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: getTrendColor(data.priceChange, theme),
                                      ml: 0.5
                                    }}
                                  >
                                    {formatPercentage(data.percentChange)}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Volume Card */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Card elevation={2}>
                            <CardContent>
                              <Typography color="textSecondary" gutterBottom variant="overline">
                                Volume
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" component="div">
                                  {formatNumber(data.volume)}
                                </Typography>
                                <BarChartIcon color="info" />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Volatility Card */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Card elevation={2}>
                            <CardContent>
                              <Typography color="textSecondary" gutterBottom variant="overline">
                                Volatility
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" component="div">
                                  {data.volatility?.toFixed(2)}%
                                </Typography>
                                <ShowChart color="warning" />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Range Card */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Card elevation={2}>
                            <CardContent>
                              <Typography color="textSecondary" gutterBottom variant="overline">
                                Day Range
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" component="div">
                                  {data.priceRange || (data.price * 0.06).toFixed(2)}
                                </Typography>
                                <CompareArrows color="secondary" />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      {/* Price Chart */}
                      <Card elevation={2} sx={{ mb: 4 }}>
                        <CardHeader 
                          title="Price History" 
                          action={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {['1D', '1W', '1M', '3M'].map((range) => (
                                <Chip 
                                  key={range}
                                  label={range} 
                                  variant={timeRange === range ? "filled" : "outlined"}
                                  color={timeRange === range ? "primary" : "default"}
                                  onClick={() => handleTimeRangeChange(range)}
                                  size="small"
                                />
                              ))}
                            </Box>
                          }
                        />
                        <CardContent>
                          <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getPriceChartData()}>
                                <defs>
                                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis 
                                  dataKey="formattedDate" 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                />
                                <YAxis 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  domain={['dataMin - 5%', 'dataMax + 5%']}
                                />
                                <RechartsTooltip 
                                  formatter={(value) => formatPrice(value, instrument)}
                                  labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Legend />
                                <Area 
                                  type="monotone" 
                                  dataKey="close" 
                                  stroke={theme.palette.primary.main} 
                                  fillOpacity={1} 
                                  fill="url(#colorPrice)"
                                  name="Close Price"
                                  animationDuration={500}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      {/* Additional Statistics */}
                      <Grid container spacing={3}>
                        {/* OHLC Data */}
                        <Grid item xs={12} md={6}>
                          <Card elevation={2}>
                            <CardHeader title="Price Information" />
                            <CardContent>
                              <TableContainer>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Open</TableCell>
                                      <TableCell align="right">
                                        ${(data.price * 0.99).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>High</TableCell>
                                      <TableCell align="right">
                                        ${(data.price * 1.03).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Low</TableCell>
                                      <TableCell align="right">
                                        ${(data.price * 0.97).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Close</TableCell>
                                      <TableCell align="right">
                                        ${data.price.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Special Events */}
                        <Grid item xs={12} md={6}>
                          <Card elevation={2}>
                            <CardHeader title="Market Events" />
                            <CardContent>
                              {data.specialEvents && data.specialEvents.length > 0 ? (
                                <List dense>
                                  {data.specialEvents.map((event, idx) => (
                                    <ListItem key={idx} divider={idx < data.specialEvents.length - 1}>
                                      <ListItemIcon>
                                        {event.type === 'earnings' ? <AttachMoney color="secondary" /> : <TrendingUp color="primary" />}
                                      </ListItemIcon>
                                      <ListItemText primary={event.description} />
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                  <Typography variant="body2" color="textSecondary">
                                    No significant events on this date
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </TabPanel>
                  
                  {/* Price Analysis Tab */}
                  <TabPanel value={activeTab} index={TABS.PRICE}>
                    <Box sx={{ p: 3 }}>
                      <Card elevation={2} sx={{ mb: 4 }}>
                        <CardHeader 
                          title="Price Analysis" 
                          action={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {['1D', '1W', '1M', '3M'].map((range) => (
                                <Chip 
                                  key={range}
                                  label={range} 
                                  variant={timeRange === range ? "filled" : "outlined"}
                                  color={timeRange === range ? "primary" : "default"}
                                  onClick={() => handleTimeRangeChange(range)}
                                  size="small"
                                />
                              ))}
                            </Box>
                          }
                        />
                        <CardContent>
                          <Box sx={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={timeRange === '1D' ? getIntradayData() : getPriceChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis 
                                  dataKey={timeRange === '1D' ? "hour" : "formattedDate"} 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                />
                                <YAxis 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  domain={['dataMin - 1%', 'dataMax + 1%']}
                                />
                                <RechartsTooltip 
                                  formatter={(value) => formatPrice(value, instrument)}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey={timeRange === '1D' ? "price" : "close"} 
                                  stroke={theme.palette.primary.main} 
                                  dot={{ r: 3 }}
                                  name="Price"
                                  strokeWidth={2}
                                  animationDuration={500}
                                />
                                {timeRange !== '1D' && (
                                  <>
                                    <Line 
                                      type="monotone" 
                                      dataKey="high" 
                                      stroke={theme.palette.success.main} 
                                      strokeDasharray="5 5"
                                      dot={false}
                                      name="High"
                                      animationDuration={500}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="low" 
                                      stroke={theme.palette.error.main} 
                                      strokeDasharray="5 5"
                                      dot={false}
                                      name="Low"
                                      animationDuration={500}
                                    />
                                  </>
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>

                      <Card elevation={2}>
                        <CardHeader title="Statistics" />
                        <CardContent>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Metric</TableCell>
                                  <TableCell align="right">Value</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell>30-Day High</TableCell>
                                  <TableCell align="right">
                                    ${historicalData.length > 0 ? 
                                      Math.max(...historicalData.map(d => d.price)).toFixed(2) : 
                                      (data.price * 1.1).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>30-Day Low</TableCell>
                                  <TableCell align="right">
                                    ${historicalData.length > 0 ? 
                                      Math.min(...historicalData.map(d => d.price)).toFixed(2) : 
                                      (data.price * 0.9).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>30-Day Avg</TableCell>
                                  <TableCell align="right">
                                    ${historicalData.length > 0 ? 
                                      (historicalData.reduce((acc, d) => acc + d.price, 0) / historicalData.length).toFixed(2) : 
                                      data.price.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Price Momentum</TableCell>
                                  <TableCell align="right" sx={{ 
                                    color: data.priceChange >= 0 ? theme.palette.success.main : theme.palette.error.main 
                                  }}>
                                    {data.priceChange >= 0 ? 'Bullish' : 'Bearish'}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Box>
                  </TabPanel>
                  
                  {/* Volatility Tab */}
                  <TabPanel value={activeTab} index={TABS.VOLATILITY}>
                    <Box sx={{ p: 3 }}>
                      <Card elevation={2} sx={{ mb: 4 }}>
                        <CardHeader title="Volatility Analysis" />
                        <CardContent>
                          <Box sx={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getVolatilityChartData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis 
                                  dataKey="formattedDate" 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                />
                                <YAxis 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                />
                                <RechartsTooltip 
                                  formatter={(value) => `${value.toFixed(2)}%`}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="volatility" 
                                  stroke={theme.palette.warning.main} 
                                  strokeWidth={2}
                                  name="Volatility (%)"
                                  dot={{ stroke: theme.palette.warning.main, strokeWidth: 2, r: 4 }}
                                  animationDuration={500}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      {/* Volatility breakdown */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                Morning Session
                              </Typography>
                              <Typography variant="h5">
                                {((data.volatility || 2) * 0.8).toFixed(2)}%
                              </Typography>
                              <Box 
                                sx={{ 
                                  height: 4, 
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.warning.light, 0.3),
                                  mt: 1,
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${(((data.volatility || 2) * 0.8) / 10) * 100}%`,
                                    backgroundColor: theme.palette.warning.light,
                                    borderRadius: 2
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                Midday Session
                              </Typography>
                              <Typography variant="h5">
                                {((data.volatility || 2) * 0.6).toFixed(2)}%
                              </Typography>
                              <Box 
                                sx={{ 
                                  height: 4, 
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.warning.main, 0.3),
                                  mt: 1,
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${(((data.volatility || 2) * 0.6) / 10) * 100}%`,
                                    backgroundColor: theme.palette.warning.main,
                                    borderRadius: 2
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                Afternoon Session
                              </Typography>
                              <Typography variant="h5">
                                {((data.volatility || 2) * 1.2).toFixed(2)}%
                              </Typography>
                              <Box 
                                sx={{ 
                                  height: 4, 
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.warning.dark, 0.3),
                                  mt: 1,
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${(((data.volatility || 2) * 1.2) / 10) * 100}%`,
                                    backgroundColor: theme.palette.warning.dark,
                                    borderRadius: 2
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </TabPanel>
                  
                  {/* Volume Tab */}
                  <TabPanel value={activeTab} index={TABS.VOLUME}>
                    <Box sx={{ p: 3 }}>
                      <Card elevation={2} sx={{ mb: 4 }}>
                        <CardHeader 
                          title="Volume Analysis" 
                          action={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {['1D', '1W', '1M'].map((range) => (
                                <Chip 
                                  key={range}
                                  label={range} 
                                  variant={timeRange === range ? "filled" : "outlined"}
                                  color={timeRange === range ? "primary" : "default"}
                                  onClick={() => handleTimeRangeChange(range)}
                                  size="small"
                                />
                              ))}
                            </Box>
                          }
                        />
                        <CardContent>
                          <Box sx={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              {timeRange === '1D' ? (
                                <BarChart data={getIntradayData()}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                  <XAxis 
                                    dataKey="hour" 
                                    tick={{ fill: theme.palette.text.secondary }} 
                                    tickLine={{ stroke: theme.palette.divider }}
                                  />
                                  <YAxis 
                                    tick={{ fill: theme.palette.text.secondary }} 
                                    tickLine={{ stroke: theme.palette.divider }}
                                  />
                                  <RechartsTooltip formatter={(value) => formatNumber(value)} />
                                  <Legend />
                                  <Bar 
                                    dataKey="volume" 
                                    name="Volume" 
                                    fill={theme.palette.info.main}
                                    animationDuration={500}
                                  />
                                </BarChart>
                              ) : (
                                <BarChart data={getVolumeChartData()}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                  <XAxis 
                                    dataKey="formattedDate" 
                                    tick={{ fill: theme.palette.text.secondary }} 
                                    tickLine={{ stroke: theme.palette.divider }}
                                  />
                                  <YAxis 
                                    tick={{ fill: theme.palette.text.secondary }} 
                                    tickLine={{ stroke: theme.palette.divider }}
                                  />
                                  <RechartsTooltip formatter={(value) => formatNumber(value)} />
                                  <Legend />
                                  <Bar 
                                    dataKey="volume" 
                                    name="Volume" 
                                    fill={theme.palette.info.main}
                                    animationDuration={500}
                                  />
                                </BarChart>
                              )}
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" color="textSecondary">
                                Daily Volume
                              </Typography>
                              <Typography variant="h4">
                                {formatNumber(data.volume)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" color="textSecondary">
                                Avg. Volume (7D)
                              </Typography>
                              <Typography variant="h4">
                                {formatNumber(
                                  historicalData.length > 0 ?
                                  historicalData.slice(-7).reduce((sum, day) => sum + day.volume, 0) / Math.min(7, historicalData.length) :
                                  data.volume * 0.9
                                )}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" color="textSecondary">
                                Volume Trend
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {getTrendIcon(
                                  historicalData.length > 0 ?
                                  (data.volume > (historicalData.slice(-7).reduce((sum, day) => sum + day.volume, 0) / Math.min(7, historicalData.length)) ? 1 : -1) :
                                  1,
                                  theme
                                )}
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    ml: 1,
                                    color: historicalData.length > 0 ?
                                    (data.volume > (historicalData.slice(-7).reduce((sum, day) => sum + day.volume, 0) / Math.min(7, historicalData.length)) ? 
                                      theme.palette.success.main : 
                                      theme.palette.error.main) :
                                    theme.palette.success.main
                                  }}
                                >
                                  {historicalData.length > 0 ?
                                    (data.volume > (historicalData.slice(-7).reduce((sum, day) => sum + day.volume, 0) / Math.min(7, historicalData.length)) ?
                                      'Above Average' :
                                      'Below Average') :
                                    'Above Average'
                                  }
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </TabPanel>
                  
                  {/* Technical Indicators Tab */}
                  <TabPanel value={activeTab} index={TABS.TECHNICAL}>
                    <Box sx={{ p: 3 }}>
                      <Card elevation={2} sx={{ mb: 4 }}>
                        <CardHeader title="Technical Indicators" />
                        <CardContent>
                          <Box sx={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getPriceChartData().map(day => ({
                                ...day,
                                sma5: day.close * (1 + (Math.random() - 0.5) * 0.01),
                                sma20: day.close * (1 + (Math.random() - 0.5) * 0.02),
                                rsi: 30 + Math.random() * 40
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis 
                                  dataKey="formattedDate" 
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                />
                                <YAxis 
                                  yAxisId="price"
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  domain={['auto', 'auto']}
                                />
                                <YAxis 
                                  yAxisId="rsi"
                                  orientation="right"
                                  tick={{ fill: theme.palette.text.secondary }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  domain={[0, 100]}
                                />
                                <RechartsTooltip 
                                  formatter={(value, name) => {
                                    if (name === 'RSI') return `${value.toFixed(2)}`;
                                    return formatPrice(value, instrument);
                                  }}
                                />
                                <Legend />
                                <Line 
                                  yAxisId="price"
                                  type="monotone" 
                                  dataKey="close" 
                                  stroke={theme.palette.primary.main} 
                                  dot={false}
                                  name="Price"
                                  strokeWidth={2}
                                />
                                <Line 
                                  yAxisId="price"
                                  type="monotone" 
                                  dataKey="sma5" 
                                  stroke={theme.palette.success.main} 
                                  dot={false}
                                  name="5-Day SMA"
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                />
                                <Line 
                                  yAxisId="price"
                                  type="monotone" 
                                  dataKey="sma20" 
                                  stroke={theme.palette.warning.main} 
                                  dot={false}
                                  name="20-Day SMA"
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                />
                                <Line 
                                  yAxisId="rsi"
                                  type="monotone" 
                                  dataKey="rsi" 
                                  stroke={theme.palette.secondary.main} 
                                  dot={false}
                                  name="RSI"
                                  strokeWidth={1}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                          
                          <Divider sx={{ my: 3 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Moving Averages
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="textSecondary">
                                        5-Day SMA
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        ${(data.price * 1.01).toFixed(2)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="textSecondary">
                                        20-Day SMA
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        ${(data.price * 0.99).toFixed(2)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="textSecondary">
                                        MA Signal
                                      </Typography>
                                      <Chip 
                                        size="small"
                                        label={data.price * 1.01 > data.price * 0.99 ? "Bullish" : "Bearish"}
                                        color={data.price * 1.01 > data.price * 0.99 ? "success" : "error"}
                                      />
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    RSI (14)
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="h4">
                                      {(40 + Math.random() * 30).toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mt: 2, position: 'relative' }}>
                                    <Box 
                                      sx={{ 
                                        height: 8, 
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, 
                                          ${theme.palette.error.main} 0%, 
                                          ${theme.palette.error.light} 30%, 
                                          ${theme.palette.warning.main} 50%, 
                                          ${theme.palette.success.light} 70%, 
                                          ${theme.palette.success.main} 100%)`
                                      }}
                                    />
                                    <Box 
                                      sx={{ 
                                        position: 'absolute',
                                        left: `${50 + (Math.random() - 0.5) * 30}%`,
                                        top: -4,
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.background.paper,
                                        border: `3px solid ${theme.palette.primary.main}`,
                                        transform: 'translateX(-50%)'
                                      }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                      <Typography variant="caption">Oversold</Typography>
                                      <Typography variant="caption">Neutral</Typography>
                                      <Typography variant="caption">Overbought</Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Market Sentiment
                                  </Typography>
                                  <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      py: 2
                                    }}
                                  >
                                    <Chip 
                                      icon={
                                        data.priceChange > 0.5
                                          ? <TrendingUp />
                                          : data.priceChange < -0.5
                                            ? <TrendingDown />
                                            : <TrendingFlat />
                                      }
                                      label={
                                        data.priceChange > 0.5
                                          ? "Bullish"
                                          : data.priceChange < -0.5
                                            ? "Bearish"
                                            : "Neutral"
                                      }
                                      color={
                                        data.priceChange > 0.5
                                          ? "success"
                                          : data.priceChange < -0.5
                                            ? "error"
                                            : "default"
                                      }
                                    />
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                      Based on technical indicators and recent performance
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  </TabPanel>
                </>
              ) : (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Market Closed
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                    The market was closed on this date.
                    {moment(selectedDate).day() === 0 && " (Sunday)"}
                    {moment(selectedDate).day() === 6 && " (Saturday)"}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Dashboard;
