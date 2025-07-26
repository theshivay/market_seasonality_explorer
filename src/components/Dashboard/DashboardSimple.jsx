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
  ShowChart
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
  Tooltip as RechartsTooltip 
} from 'recharts';
import useMarketData from '../../hooks/useMarketData';
import moment from 'moment';

// Dashboard tabs
const TABS = {
  OVERVIEW: 0,
  PRICE: 1,
  VOLATILITY: 2,
  VOLUME: 3
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Generate sample chart data
  const generateChartData = () => {
    const days = 7;
    const basePrice = dayData?.close || 50000;
    return Array.from({ length: days }, (_, i) => {
      const date = moment(selectedDate).subtract(days - 1 - i, 'days');
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation);
      return {
        date: date.format('MMM D'),
        price: price,
        volume: Math.random() * 1000000 + 500000,
        volatility: Math.random() * 15 + 2
      };
    });
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab icon={<AttachMoney />} label="Overview" />
            <Tab icon={<ShowChart />} label="Price" />
            <Tab icon={<TrendingUp />} label="Volatility" />
            <Tab icon={<BarChartIcon />} label="Volume" />
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

                    {/* Liquidity Card */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom variant="overline">
                            Liquidity
                          </Typography>
                          <Typography variant="h5" component="div">
                            {dayData?.liquidity ? dayData.liquidity.toFixed(1) : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Market liquidity score
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

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
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Dashboard;
