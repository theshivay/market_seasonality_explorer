import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  IconButton, 
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  AttachMoney,
  BarChart as BarChartIcon,
  ShowChart,
  Analytics,
  CompareArrows
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line
} from 'recharts';
import useMarketData from '../../hooks/useMarketData';
import { 
  calculateVIXLike, 
  calculateMultipleMovingAverages, 
  calculateBenchmarkComparison,
  calculateAllIndicators
} from '../../utils/technicalIndicators';
import moment from 'moment';

// Dashboard tabs
const TABS = {
  OVERVIEW: 0,
  PRICE: 1,
  VOLATILITY: 2,
  VOLUME: 3,
  TECHNICAL: 4,
  BENCHMARK: 5
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

// Helper function to format price
const formatPrice = (price) => {
  if (!price) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Helper function to format percentage
const formatPercentage = (value) => {
  if (!value) return '0.00%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const Dashboard = ({ 
  open, 
  onClose, 
  selectedDate, 
  selectedDateData, 
  instrument, 
  useRealData, 
  dateRange 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [movingAverages, setMovingAverages] = useState({});
  const [vixLike, setVixLike] = useState(0);
  const [benchmarkComparison, setBenchmarkComparison] = useState(null);
  const [advancedIndicators, setAdvancedIndicators] = useState({});
  
  // Use the hook to fetch market data
  const { data, loading } = useMarketData(selectedDate, instrument, useRealData);
  
  // Extract the data for the selected date
  const dateStr = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : null;
  const dayData = selectedDateData || (dateStr && data && data[dateStr] ? data[dateStr] : null);
  
  // Debug log
  useEffect(() => {
    console.log('[Dashboard] Rendering with:', { 
      open,
      dateStr, 
      dayDataAvailable: !!dayData,
      selectedDateDataAvailable: !!selectedDateData,
      dataKeys: data ? Object.keys(data) : [],
      loading
    });
  }, [open, dateStr, dayData, selectedDateData, data, loading]);

  // Calculate advanced metrics when data changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const dataArray = Object.values(data);
      
      // Calculate moving averages
      const mas = calculateMultipleMovingAverages(dataArray);
      setMovingAverages(mas);
      
      // Calculate VIX-like volatility index
      const vixValue = calculateVIXLike(dataArray);
      setVixLike(vixValue);
      
      // Calculate all advanced technical indicators
      const indicators = calculateAllIndicators(dataArray);
      setAdvancedIndicators(indicators);
      
      // Calculate benchmark comparison (using market average as benchmark)
      if (dayData && dataArray.length > 1) {
        // Create a simple benchmark from average market performance
        const avgPerformance = dataArray.reduce((sum, item) => sum + (item.performance || 0), 0) / dataArray.length;
        const benchmarkData = { performance: avgPerformance };
        const comparison = calculateBenchmarkComparison(dayData, benchmarkData, dataArray, dataArray);
        setBenchmarkComparison(comparison);
      }
    }
  }, [data, dayData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Generate sample chart data
  const generateChartData = () => {
    const days = 7;
    const basePrice = dayData?.close || 50000;
    const chartData = [];
    
    for (let i = 0; i < days; i++) {
      const date = moment(selectedDate).subtract(days - 1 - i, 'days');
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation);
      
      // Calculate simple moving averages for chart
      const sma5 = i >= 4 ? price * (0.98 + Math.random() * 0.04) : null;
      const sma20 = price * (0.95 + Math.random() * 0.1);
      
      chartData.push({
        date: date.format('MMM D'),
        price: price,
        volume: Math.random() * 1000000 + 500000,
        volatility: Math.random() * 15 + 2,
        sma5: sma5,
        sma20: sma20
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();
  
  if (!selectedDate) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: '100%', sm: '85%', md: '80%' }, 
          maxWidth: '1200px'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.palette.background.default }}>
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {instrument?.name || 'Market Data'}
            </Typography>
            <Typography variant="subtitle2">
              {moment(selectedDate).format('dddd, MMMM D, YYYY')}
            </Typography>
          </Box>
          
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'inherit' }}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, backgroundColor: theme.palette.background.paper }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            sx={{
              '& .MuiTab-root': {
                color: theme.palette.text.primary,
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              }
            }}
          >
            <Tab icon={<AttachMoney />} label="Overview" />
            <Tab icon={<ShowChart />} label="Price" />
            <Tab icon={<TrendingUp />} label="Volatility" />
            <Tab icon={<BarChartIcon />} label="Volume" />
            <Tab icon={<Analytics />} label="Technical" />
            <Tab icon={<CompareArrows />} label="Benchmark" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={150} />
            </Box>
          ) : (
            <>
              {/* Overview Tab */}
              <TabPanel value={activeTab} index={TABS.OVERVIEW}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Price Card */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom variant="overline">
                            Current Price
                          </Typography>
                          <Typography variant="h4" component="div">
                            {formatPrice(dayData?.close || dayData?.price || 0)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {getTrendIcon(dayData?.performance || 0, theme)}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                ml: 1,
                                color: (dayData?.performance || 0) > 0 ? 'success.main' : 
                                       (dayData?.performance || 0) < 0 ? 'error.main' : 'text.secondary'
                              }}
                            >
                              {formatPercentage(dayData?.performance || 0)}
                            </Typography>
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
                          <Typography variant="h5" component="div">
                            {dayData?.volume ? `${(dayData.volume / 1000000).toFixed(1)}M` : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            24h trading volume
                          </Typography>
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
                          <Typography variant="h5" component="div">
                            {dayData?.volatility ? `${dayData.volatility.toFixed(1)}%` : 'N/A'}
                          </Typography>
                          <Chip 
                            label={
                              (dayData?.volatility || 0) < 5 ? 'Low' :
                              (dayData?.volatility || 0) < 15 ? 'Medium' : 'High'
                            }
                            color={
                              (dayData?.volatility || 0) < 5 ? 'success' :
                              (dayData?.volatility || 0) < 15 ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* VIX-like Index Card */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom variant="overline">
                            VIX-like Index
                          </Typography>
                          <Typography variant="h5" component="div">
                            {vixLike ? vixLike.toFixed(1) : 'N/A'}
                          </Typography>
                          <Chip 
                            label={
                              vixLike < 20 ? 'Low Fear' :
                              vixLike < 30 ? 'Moderate' : 
                              vixLike < 40 ? 'High Fear' : 'Extreme Fear'
                            }
                            color={
                              vixLike < 20 ? 'success' :
                              vixLike < 30 ? 'info' :
                              vixLike < 40 ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ mt: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Market fear gauge
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Quick Technical Overview */}
                  <Card sx={{ mt: 3 }} elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Technical Indicators Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                            <Typography color="textSecondary" variant="caption">
                              SMA 5
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              ${dayData?.technicalIndicators?.sma5?.toFixed(0) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                            <Typography color="textSecondary" variant="caption">
                              SMA 20
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              ${dayData?.technicalIndicators?.sma20?.toFixed(0) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                            <Typography color="textSecondary" variant="caption">
                              RSI
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {dayData?.technicalIndicators?.rsi?.toFixed(0) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                            <Typography color="textSecondary" variant="caption">
                              Liquidity
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {dayData?.liquidity?.toFixed(1) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Performance vs Benchmark Quick Summary */}
                      {benchmarkComparison && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Performance vs Benchmark
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`Alpha: ${benchmarkComparison.alpha > 0 ? '+' : ''}${benchmarkComparison.alpha.toFixed(2)}%`}
                              color={benchmarkComparison.alpha > 0 ? 'success' : 'error'}
                              size="small"
                            />
                            <Chip 
                              label={`Beta: ${benchmarkComparison.beta.toFixed(2)}`}
                              color="default"
                              size="small"
                            />
                            <Chip 
                              label={benchmarkComparison.outperformance ? 'Outperforming' : 'Underperforming'}
                              color={benchmarkComparison.outperformance ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Debug Info */}
                  <Card sx={{ mt: 3 }} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Debug Information
                      </Typography>
                      <Typography variant="body2" component="div">
                        Selected Date: {dateStr}<br />
                        Data Available: {dayData ? 'Yes' : 'No'}<br />
                        {/* All Available Dates: {data ? Object.keys(data).join(', ') : 'None'}<br /> */}
                        Instrument: {instrument?.id || instrument}<br />
                        Use Real Data: {useRealData ? 'Yes' : 'No'}<br />
                        Date Range: {dateRange?.start && dateRange?.end ? 
                          `${moment(dateRange.start).format('MMM D')} - ${moment(dateRange.end).format('MMM D')}` : 'None'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Price Tab */}
              <TabPanel value={activeTab} index={TABS.PRICE}>
                <Box sx={{ p: 3 }}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Price Trend (7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={theme.palette.primary.main}
                            fill={theme.palette.primary.light}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Volatility Tab */}
              <TabPanel value={activeTab} index={TABS.VOLATILITY}>
                <Box sx={{ p: 3 }}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Volatility Trend (7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area 
                            type="monotone" 
                            dataKey="volatility" 
                            stroke={theme.palette.warning.main}
                            fill={theme.palette.warning.light}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Volume Tab */}
              <TabPanel value={activeTab} index={TABS.VOLUME}>
                <Box sx={{ p: 3 }}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Volume Trend (7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar 
                            dataKey="volume" 
                            fill={theme.palette.secondary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Technical Analysis Tab */}
              <TabPanel value={activeTab} index={TABS.TECHNICAL}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* VIX-like Volatility Index */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom variant="overline">
                            VIX-like Volatility Index
                          </Typography>
                          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                            {vixLike.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={
                              vixLike < 20 ? 'Low Fear' :
                              vixLike < 30 ? 'Moderate Fear' : 
                              vixLike < 40 ? 'High Fear' : 'Extreme Fear'
                            }
                            color={
                              vixLike < 20 ? 'success' :
                              vixLike < 30 ? 'info' :
                              vixLike < 40 ? 'warning' : 'error'
                            }
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Annualized volatility index measuring market fear
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* RSI */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom variant="overline">
                            RSI (14-day)
                          </Typography>
                          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                            {dayData?.technicalIndicators?.rsi?.toFixed(1) || 'N/A'}
                          </Typography>
                          <Chip 
                            label={
                              (dayData?.technicalIndicators?.rsi || 50) > 70 ? 'Overbought' :
                              (dayData?.technicalIndicators?.rsi || 50) < 30 ? 'Oversold' : 'Neutral'
                            }
                            color={
                              (dayData?.technicalIndicators?.rsi || 50) > 70 ? 'error' :
                              (dayData?.technicalIndicators?.rsi || 50) < 30 ? 'success' : 'default'
                            }
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Relative Strength Index
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Moving Averages */}
                    <Grid item xs={12}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Moving Averages
                          </Typography>
                          
                          {/* Moving Averages Chart */}
                          <Box sx={{ mb: 3 }}>
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke={theme.palette.primary.main}
                                  strokeWidth={2}
                                  name="Price"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="sma5" 
                                  stroke={theme.palette.success.main}
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  name="SMA 5"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="sma20" 
                                  stroke={theme.palette.warning.main}
                                  strokeWidth={1}
                                  strokeDasharray="10 5"
                                  name="SMA 20"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  SMA 5
                                </Typography>
                                <Typography variant="h6">
                                  ${dayData?.technicalIndicators?.sma5?.toFixed(2) || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  SMA 20
                                </Typography>
                                <Typography variant="h6">
                                  ${dayData?.technicalIndicators?.sma20?.toFixed(2) || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  MA 10
                                </Typography>
                                <Typography variant="h6">
                                  ${movingAverages.MA10?.toFixed(2) || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  MA 50
                                </Typography>
                                <Typography variant="h6">
                                  ${movingAverages.MA50?.toFixed(2) || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {/* Moving Average Signals */}
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Signals
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {dayData?.close && dayData?.technicalIndicators?.sma5 && (
                                <Chip 
                                  label={dayData.close > dayData.technicalIndicators.sma5 ? 'Above SMA5' : 'Below SMA5'}
                                  color={dayData.close > dayData.technicalIndicators.sma5 ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                              {dayData?.close && dayData?.technicalIndicators?.sma20 && (
                                <Chip 
                                  label={dayData.close > dayData.technicalIndicators.sma20 ? 'Above SMA20' : 'Below SMA20'}
                                  color={dayData.close > dayData.technicalIndicators.sma20 ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Advanced Technical Indicators */}
                    <Grid item xs={12}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Advanced Technical Indicators
                          </Typography>
                          
                          {/* Oscillators Row */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                              Oscillators
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Stochastic %K
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.stochastic?.k?.toFixed(1) || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={advancedIndicators.stochastic?.signal || 'neutral'}
                                    color={
                                      advancedIndicators.stochastic?.signal === 'overbought' ? 'error' :
                                      advancedIndicators.stochastic?.signal === 'oversold' ? 'success' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    CCI
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.cci?.toFixed(1) || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={
                                      (advancedIndicators.cci || 0) > 100 ? 'Overbought' :
                                      (advancedIndicators.cci || 0) < -100 ? 'Oversold' : 'Neutral'
                                    }
                                    color={
                                      (advancedIndicators.cci || 0) > 100 ? 'error' :
                                      (advancedIndicators.cci || 0) < -100 ? 'success' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Williams %R
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.williamsR?.toFixed(1) || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={
                                      (advancedIndicators.williamsR || 0) > -20 ? 'Overbought' :
                                      (advancedIndicators.williamsR || 0) < -80 ? 'Oversold' : 'Neutral'
                                    }
                                    color={
                                      (advancedIndicators.williamsR || 0) > -20 ? 'error' :
                                      (advancedIndicators.williamsR || 0) < -80 ? 'success' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Money Flow Index
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.mfi?.toFixed(1) || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={
                                      (advancedIndicators.mfi || 50) > 80 ? 'Overbought' :
                                      (advancedIndicators.mfi || 50) < 20 ? 'Oversold' : 'Neutral'
                                    }
                                    color={
                                      (advancedIndicators.mfi || 50) > 80 ? 'error' :
                                      (advancedIndicators.mfi || 50) < 20 ? 'success' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* MACD Indicator */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                              MACD (Moving Average Convergence Divergence)
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    MACD Line
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.macd?.macd?.toFixed(4) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Signal Line
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.macd?.signal?.toFixed(4) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Histogram
                                  </Typography>
                                  <Typography variant="h6" sx={{
                                    color: (advancedIndicators.macd?.histogram || 0) > 0 ? 'success.main' : 'error.main'
                                  }}>
                                    {advancedIndicators.macd?.histogram?.toFixed(4) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={
                                  (advancedIndicators.macd?.macd || 0) > (advancedIndicators.macd?.signal || 0) ? 
                                  'Bullish Signal' : 'Bearish Signal'
                                }
                                color={
                                  (advancedIndicators.macd?.macd || 0) > (advancedIndicators.macd?.signal || 0) ? 
                                  'success' : 'error'
                                }
                                size="small"
                              />
                            </Box>
                          </Box>

                          {/* Bollinger Bands */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                              Bollinger Bands
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Upper Band
                                  </Typography>
                                  <Typography variant="h6">
                                    ${advancedIndicators.bollingerBands?.upper?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Middle (SMA)
                                  </Typography>
                                  <Typography variant="h6">
                                    ${advancedIndicators.bollingerBands?.middle?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Lower Band
                                  </Typography>
                                  <Typography variant="h6">
                                    ${advancedIndicators.bollingerBands?.lower?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 1 }}>
                              {dayData?.close && advancedIndicators.bollingerBands && (
                                <Chip 
                                  label={
                                    dayData.close > advancedIndicators.bollingerBands.upper ? 'Above Upper Band' :
                                    dayData.close < advancedIndicators.bollingerBands.lower ? 'Below Lower Band' :
                                    'Within Bands'
                                  }
                                  color={
                                    dayData.close > advancedIndicators.bollingerBands.upper ? 'error' :
                                    dayData.close < advancedIndicators.bollingerBands.lower ? 'success' : 'default'
                                  }
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Volatility & Trend Indicators */}
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                              Volatility & Trend
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    ATR (14)
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.atr?.toFixed(2) || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Volatility measure
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Parabolic SAR
                                  </Typography>
                                  <Typography variant="h6">
                                    ${advancedIndicators.parabolicSAR?.sar?.toFixed(2) || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={advancedIndicators.parabolicSAR?.trend || 'neutral'}
                                    color={
                                      advancedIndicators.parabolicSAR?.trend === 'bullish' ? 'success' :
                                      advancedIndicators.parabolicSAR?.trend === 'bearish' ? 'error' : 'default'
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                  <Typography color="textSecondary" variant="caption">
                                    Ichimoku Signal
                                  </Typography>
                                  <Typography variant="h6">
                                    {advancedIndicators.ichimoku ? 'Active' : 'N/A'}
                                  </Typography>
                                  {advancedIndicators.ichimoku && dayData?.close && (
                                    <Chip 
                                      label={
                                        dayData.close > advancedIndicators.ichimoku.cloudTop ? 'Above Cloud' :
                                        dayData.close < advancedIndicators.ichimoku.cloudBottom ? 'Below Cloud' : 'In Cloud'
                                      }
                                      color={
                                        dayData.close > advancedIndicators.ichimoku.cloudTop ? 'success' :
                                        dayData.close < advancedIndicators.ichimoku.cloudBottom ? 'error' : 'warning'
                                      }
                                      size="small"
                                    />
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Benchmark Comparison Tab */}
              <TabPanel value={activeTab} index={TABS.BENCHMARK}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Performance Comparison */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Performance vs Benchmark
                          </Typography>
                          {benchmarkComparison ? (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Alpha (Excess Return)
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                  color: benchmarkComparison.alpha > 0 ? 'success.main' : 'error.main' 
                                }}>
                                  {benchmarkComparison.alpha > 0 ? '+' : ''}{benchmarkComparison.alpha.toFixed(2)}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Beta (Market Sensitivity)
                                </Typography>
                                <Typography variant="h6">
                                  {benchmarkComparison.beta.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Correlation
                                </Typography>
                                <Typography variant="h6">
                                  {(benchmarkComparison.correlation * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Chip 
                                label={benchmarkComparison.outperformance ? 'Outperforming' : 'Underperforming'}
                                color={benchmarkComparison.outperformance ? 'success' : 'error'}
                                size="small"
                              />
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Insufficient data for benchmark comparison
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Market Indices Comparison */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Market Indices
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                S&P 500 (Simulated)
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'success.main' }}>
                                +0.8%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                Bitcoin Dominance
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'warning.main' }}>
                                52.3%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                Fear & Greed Index
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'error.main' }}>
                                {Math.round(100 - vixLike)} (Fear)
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Risk Metrics */}
                    <Grid item xs={12}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Risk Metrics
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  Sharpe Ratio (Est.)
                                </Typography>
                                <Typography variant="h6">
                                  {((dayData?.performance || 0) / (dayData?.volatility || 1)).toFixed(2)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  Max Drawdown (Est.)
                                </Typography>
                                <Typography variant="h6">
                                  -{(dayData?.volatility || 5).toFixed(1)}%
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                                <Typography color="textSecondary" variant="caption">
                                  Value at Risk (1%)
                                </Typography>
                                <Typography variant="h6">
                                  -{((dayData?.volatility || 5) * 2.33).toFixed(1)}%
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Dashboard;
