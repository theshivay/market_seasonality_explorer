import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Alert
} from '@mui/material';
import {
  CompareArrows,
  Close,
  Analytics,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  DateRange,
  BarChart,
  ShowChart,
  Add,
  Clear
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import moment from 'moment';
import { calculateAllIndicators } from '../utils/technicalIndicators'
const DataComparison = ({ open, onClose }) => {
  const theme = useTheme();
  // Future integration with AppContext for instrument selection
  // const { selectedInstrument, useRealData } = useContext(AppContext);
  
  // Comparison periods state
  const [periods, setPeriods] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState({
    name: '',
    startDate: null,
    endDate: null,
    quickSelect: ''
  });
  const [comparisonData, setComparisonData] = useState([]);
  const [chartType, setChartType] = useState('performance'); // 'performance', 'volatility', 'volume'

  // Get market data for analysis (for future integration)
  // const marketData = useMarketData(selectedInstrument, useRealData);

  // Quick select options
  const quickSelectOptions = [
    { label: 'Last 7 Days', value: '7d', days: 7 },
    { label: 'Last 14 Days', value: '14d', days: 14 },
    { label: 'Last Month', value: '1m', days: 30 },
    { label: 'Last 3 Months', value: '3m', days: 90 },
    { label: 'Last 6 Months', value: '6m', days: 180 },
    { label: 'Last Year', value: '1y', days: 365 },
    { label: 'Q1 2024', value: 'q1_2024', start: '2024-01-01', end: '2024-03-31' },
    { label: 'Q2 2024', value: 'q2_2024', start: '2024-04-01', end: '2024-06-30' },
    { label: 'Q3 2024', value: 'q3_2024', start: '2024-07-01', end: '2024-09-30' },
    { label: 'Q4 2024', value: 'q4_2024', start: '2024-10-01', end: '2024-12-31' }
  ];

  // Handle quick select
  const handleQuickSelect = (option) => {
    let startDate, endDate, name;
    
    if (option.days) {
      endDate = moment();
      startDate = moment().subtract(option.days, 'days');
      name = option.label;
    } else {
      startDate = moment(option.start);
      endDate = moment(option.end);
      name = option.label;
    }
    
    setCurrentPeriod({
      name,
      startDate,
      endDate,
      quickSelect: option.value
    });
  };

  // Add period to comparison
  const addPeriod = () => {
    if (!currentPeriod.startDate || !currentPeriod.endDate) return;
    
    const newPeriod = {
      id: Date.now(),
      name: currentPeriod.name || `${currentPeriod.startDate.format('MMM D')} - ${currentPeriod.endDate.format('MMM D, YYYY')}`,
      startDate: currentPeriod.startDate,
      endDate: currentPeriod.endDate,
      color: getRandomColor()
    };
    
    setPeriods(prev => [...prev, newPeriod]);
    setCurrentPeriod({ name: '', startDate: null, endDate: null, quickSelect: '' });
  };

  // Remove period from comparison
  const removePeriod = (id) => {
    setPeriods(prev => prev.filter(p => p.id !== id));
  };

  // Get random color for chart
  const getRandomColor = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
      '#9C27B0', // Purple
      '#FF5722', // Deep Orange
      '#607D8B', // Blue Grey
      '#795548'  // Brown
    ];
    return colors[periods.length % colors.length];
  };

  // Effect to recalculate when periods change
  useEffect(() => {
    const calculateComparisonMetrics = async () => {
      if (periods.length < 2) return;
      
      try {
        const analysisData = [];
        
        for (const period of periods) {
          // Generate mock data for the period (in real app, fetch from API)
          const periodData = generateMockDataForPeriod(period.startDate, period.endDate);
          const indicators = calculateAllIndicators(periodData);
          
          // Calculate key metrics
          const startPrice = periodData[0]?.price || 100;
          const endPrice = periodData[periodData.length - 1]?.price || 100;
          const performance = ((endPrice - startPrice) / startPrice) * 100;
          
          // Use correct volatility property with fallback
          const volatility = indicators.historicalVolatility || indicators.annualizedVolatility || Math.random() * 15 + 5;
          const totalVolume = periodData.reduce((sum, day) => sum + (day.volume || 0), 0);
          const avgVolume = totalVolume / periodData.length;
          
          // Max drawdown calculation
          let maxDrawdown = 0;
          let peak = startPrice;
          periodData.forEach(day => {
            if (day.price > peak) peak = day.price;
            const drawdown = ((peak - day.price) / peak) * 100;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
          });

          analysisData.push({
            id: period.id,
            name: period.name,
            startDate: period.startDate.format('MMM D, YYYY'),
            endDate: period.endDate.format('MMM D, YYYY'),
            days: period.endDate.diff(period.startDate, 'days') + 1,
            performance: performance,
            volatility: volatility,
            avgVolume: avgVolume,
            maxDrawdown: maxDrawdown,
            sharpeRatio: performance / (volatility || 1),
            color: period.color,
            chartData: periodData.map((day, index) => ({
              day: index + 1,
              date: moment(period.startDate).add(index, 'days').format('MMM D'),
              price: day.price,
              volume: day.volume,
              volatility: day.volatility || Math.random() * 10 + 2,
              performance: ((day.price - startPrice) / startPrice) * 100
            }))
          });
        }
        
        setComparisonData(analysisData);
      } catch (error) {
        console.error('Error calculating comparison metrics:', error);
      }
    };

    if (periods.length >= 2) {
      calculateComparisonMetrics();
    }
  }, [periods]);

  // Generate mock data for a period (replace with real API call)
  const generateMockDataForPeriod = (startDate, endDate) => {
    const data = [];
    const days = endDate.diff(startDate, 'days') + 1;
    let price = 100 + Math.random() * 50; // Starting price
    
    for (let i = 0; i < days; i++) {
      const volatility = Math.random() * 15 + 1; // 1-16% volatility
      const change = (Math.random() - 0.5) * volatility * 0.5;
      price *= (1 + change / 100);
      
      data.push({
        date: moment(startDate).add(i, 'days').format('YYYY-MM-DD'),
        price: price,
        volume: Math.random() * 1000000 + 100000,
        volatility: volatility
      });
    }
    
    return data;
  };

  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp sx={{ color: theme.palette.success.main }} />;
    if (value < 0) return <TrendingDown sx={{ color: theme.palette.error.main }} />;
    return <TrendingFlat sx={{ color: theme.palette.warning.main }} />;
  };

  // Render comparison chart
  const renderComparisonChart = () => {
    if (!comparisonData.length) return null;

    // Prepare data for multi-line chart
    const maxDays = Math.max(...comparisonData.map(d => d.chartData.length));
    const chartData = [];
    
    for (let i = 0; i < maxDays; i++) {
      const point = { day: i + 1 };
      comparisonData.forEach(period => {
        if (period.chartData[i]) {
          const key = chartType === 'performance' ? 'performance' : 
                     chartType === 'volatility' ? 'volatility' : 'volume';
          point[period.name] = period.chartData[i][key];
        }
      });
      chartData.push(point);
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="day" 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              color: theme.palette.text.primary
            }}
          />
          <Legend />
          {comparisonData.map(period => (
            <Line
              key={period.id}
              type="monotone"
              dataKey={period.name}
              stroke={period.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          <Typography variant="h6">Data Comparison - Side by Side Analysis</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: theme.palette.primary.contrastText }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        {/* Period Selection Section */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRange />
            Add Comparison Periods
          </Typography>
          
          {/* Quick Select Options */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Quick Select:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickSelectOptions.map(option => (
                <Button
                  key={option.value}
                  variant={currentPeriod.quickSelect === option.value ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleQuickSelect(option)}
                  sx={{ mb: 1 }}
                >
                  {option.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Current Period Display */}
          {currentPeriod.startDate && currentPeriod.endDate && (
            <Box sx={{ mb: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Selected Period:</strong> {currentPeriod.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentPeriod.startDate.format('MMM D, YYYY')} to {currentPeriod.endDate.format('MMM D, YYYY')} 
                ({currentPeriod.endDate.diff(currentPeriod.startDate, 'days') + 1} days)
              </Typography>
            </Box>
          )}

          {/* Add Period Button */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addPeriod}
            disabled={!currentPeriod.startDate || !currentPeriod.endDate}
            sx={{ mr: 1 }}
          >
            Add to Comparison
          </Button>

          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={() => setPeriods([])}
            disabled={periods.length === 0}
          >
            Clear All
          </Button>
        </Paper>

        {/* Added Periods */}
        {periods.length > 0 && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>Comparison Periods ({periods.length})</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {periods.map(period => (
                <Chip
                  key={period.id}
                  label={period.name}
                  onDelete={() => removePeriod(period.id)}
                  sx={{
                    backgroundColor: period.color + '20',
                    borderColor: period.color,
                    color: period.color
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Comparison Analysis */}
        {comparisonData.length >= 2 && (
          <>
            {/* Chart Type Selector */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShowChart />
                  Comparison Chart
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    label="Chart Type"
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <MenuItem value="performance">Performance (%)</MenuItem>
                    <MenuItem value="volatility">Volatility (%)</MenuItem>
                    <MenuItem value="volume">Volume</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {renderComparisonChart()}
            </Paper>

            {/* Metrics Comparison Table */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart />
                Metrics Comparison
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Period</strong></TableCell>
                      <TableCell align="right"><strong>Duration</strong></TableCell>
                      <TableCell align="right"><strong>Performance</strong></TableCell>
                      <TableCell align="right"><strong>Volatility</strong></TableCell>
                      <TableCell align="right"><strong>Max Drawdown</strong></TableCell>
                      <TableCell align="right"><strong>Sharpe Ratio</strong></TableCell>
                      <TableCell align="right"><strong>Avg Volume</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparisonData.map(period => (
                      <TableRow key={period.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                backgroundColor: period.color,
                                borderRadius: '50%'
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {period.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {period.startDate} to {period.endDate}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{period.days} days</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {getTrendIcon(period.performance || 0)}
                            <Typography
                              color={(period.performance || 0) > 0 ? 'success.main' : (period.performance || 0) < 0 ? 'error.main' : 'warning.main'}
                              fontWeight="bold"
                            >
                              {(period.performance || 0) > 0 ? '+' : ''}{(period.performance || 0).toFixed(2)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{(period.volatility || 0).toFixed(2)}%</TableCell>
                        <TableCell align="right">
                          <Typography color="error.main">
                            -{(period.maxDrawdown || 0).toFixed(2)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={(period.sharpeRatio || 0) > 1 ? 'success.main' : (period.sharpeRatio || 0) > 0 ? 'warning.main' : 'error.main'}
                          >
                            {(period.sharpeRatio || 0).toFixed(3)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {(period.avgVolume || 0).toLocaleString(undefined, {
                            notation: 'compact',
                            maximumFractionDigits: 1
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Winner Analysis */}
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics />
                Period Analysis Summary
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: theme.palette.success.light + '20' }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      🏆 Best Performance
                    </Typography>
                    {(() => {
                      const best = comparisonData.reduce((prev, current) => 
                        ((prev.performance || 0) > (current.performance || 0)) ? prev : current
                      );
                      return (
                        <Typography variant="h6">
                          {best.name}: +{(best.performance || 0).toFixed(2)}%
                        </Typography>
                      );
                    })()}
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: theme.palette.info.light + '20' }}>
                    <Typography variant="subtitle2" color="info.main" gutterBottom>
                      📊 Most Stable (Lowest Volatility)
                    </Typography>
                    {(() => {
                      const stable = comparisonData.reduce((prev, current) => 
                        ((prev.volatility || 0) < (current.volatility || 0)) ? prev : current
                      );
                      return (
                        <Typography variant="h6">
                          {stable.name}: {(stable.volatility || 0).toFixed(2)}%
                        </Typography>
                      );
                    })()}
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: theme.palette.warning.light + '20' }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      ⚡ Highest Risk (Max Drawdown)
                    </Typography>
                    {(() => {
                      const risky = comparisonData.reduce((prev, current) => 
                        ((prev.maxDrawdown || 0) > (current.maxDrawdown || 0)) ? prev : current
                      );
                      return (
                        <Typography variant="h6">
                          {risky.name}: -{(risky.maxDrawdown || 0).toFixed(2)}%
                        </Typography>
                      );
                    })()}
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, backgroundColor: theme.palette.secondary.light + '20' }}>
                    <Typography variant="subtitle2" color="secondary.main" gutterBottom>
                      🎯 Best Risk-Adjusted (Sharpe)
                    </Typography>
                    {(() => {
                      const bestSharpe = comparisonData.reduce((prev, current) => 
                        ((prev.sharpeRatio || 0) > (current.sharpeRatio || 0)) ? prev : current
                      );
                      return (
                        <Typography variant="h6">
                          {bestSharpe.name}: {(bestSharpe.sharpeRatio || 0).toFixed(3)}
                        </Typography>
                      );
                    })()}
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {/* Empty State */}
        {periods.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Add at least 2 periods to start comparing. Select from quick options above or choose custom date ranges.
          </Alert>
        )}

        {periods.length === 1 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Add one more period to enable side-by-side comparison analysis.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          disabled={comparisonData.length < 2}
          onClick={() => {
            // Could add export functionality here
            console.log('Export comparison data:', comparisonData);
          }}
        >
          Export Comparison
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataComparison;
