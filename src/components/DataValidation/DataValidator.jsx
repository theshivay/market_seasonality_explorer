import React, { useState, useContext, createContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';

// Create a local context reference since there seems to be a circular import issue
const AppContext = createContext();
import marketDataService from '../../services/marketDataService';
import { fetchOKXData, fetchCoinGeckoData } from '../../services/apiService';

const DataValidator = () => {
  const { selectedInstrument, INSTRUMENTS, useRealData, setUseRealData } = useContext(AppContext);
  const [instrument, setInstrument] = useState(selectedInstrument ? selectedInstrument.id : INSTRUMENTS[0].id);
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [dataSource, setDataSource] = useState('service'); // service, okx, coingecko
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      const instrumentObj = INSTRUMENTS.find(i => i.id === instrument) || { id: instrument };
      
      switch(dataSource) {
        case 'okx': {
          result = await fetchOKXData(
            instrument, 
            '1D', 
            100, 
            moment(startDate).format('YYYY-MM-DD'), 
            moment(endDate).format('YYYY-MM-DD')
          );
          break;
        }
        case 'coingecko': {
          const coinId = instrument.toLowerCase().replace('-usd', '').replace('-usdt', '');
          const days = moment(endDate).diff(moment(startDate), 'days') + 1;
          result = await fetchCoinGeckoData(coinId, 'usd', days);
          break;
        }
        case 'service':
        default:
          // Set useRealData flag in service
          marketDataService.useRealData = useRealData;
          result = await marketDataService.getHistoricalData(
            { start: moment(startDate), end: moment(endDate) },
            instrumentObj
          );
      }
      
      setData(result);
      
      // Calculate statistics
      if (result && Object.keys(result).length > 0) {
        const dates = Object.keys(result).sort();
        const values = dates.map(date => result[date]);
        
        const stats = {
          dateRange: {
            first: dates[0],
            last: dates[dates.length - 1],
            totalDays: dates.length,
            expectedDays: moment(endDate).diff(moment(startDate), 'days') + 1,
            coverage: ((dates.length / (moment(endDate).diff(moment(startDate), 'days') + 1)) * 100).toFixed(1) + '%'
          },
          values: {
            avgClose: values.reduce((sum, v) => sum + v.close, 0) / values.length,
            avgVolume: values.reduce((sum, v) => sum + v.volume, 0) / values.length,
            maxClose: Math.max(...values.map(v => v.close)),
            minClose: Math.min(...values.map(v => v.close)),
            maxVolume: Math.max(...values.map(v => v.volume)),
            minVolume: Math.min(...values.map(v => v.volume))
          },
          missingDates: []
        };
        
        // Check for missing dates
        let currentDate = moment(startDate);
        while (currentDate <= moment(endDate)) {
          const dateStr = currentDate.format('YYYY-MM-DD');
          if (!result[dateStr]) {
            stats.missingDates.push(dateStr);
          }
          currentDate.add(1, 'day');
        }
        
        setStats(stats);
      }
      
    } catch (err) {
      console.error('Error in data validation:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Data Validation Tool</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Instrument</InputLabel>
            <Select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              label="Instrument"
            >
              {INSTRUMENTS.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          
          <FormControl fullWidth>
            <InputLabel>Data Source</InputLabel>
            <Select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              label="Data Source"
            >
              <MenuItem value="service">Market Data Service</MenuItem>
              <MenuItem value="okx">OKX API Direct</MenuItem>
              <MenuItem value="coingecko">CoinGecko API Direct</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Validate Data'}
          </Button>
          
          {dataSource === 'service' && (
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Data Mode:</Typography>
                <Button 
                  variant={useRealData ? "contained" : "outlined"}
                  size="small"
                  color={useRealData ? "success" : "primary"}
                  onClick={() => setUseRealData(true)}
                  sx={{ mr: 1 }}
                >
                  Real API
                </Button>
                <Button 
                  variant={!useRealData ? "contained" : "outlined"}
                  size="small"
                  color={!useRealData ? "error" : "primary"}
                  onClick={() => setUseRealData(false)}
                >
                  Mock Data
                </Button>
              </Box>
            </FormControl>
          )}
        </Box>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6">Error:</Typography>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {stats && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Data Statistics</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Date Range Coverage:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2">First Date:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.dateRange.first}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Last Date:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.dateRange.last}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Days with Data:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.dateRange.totalDays}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Expected Days:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.dateRange.expectedDays}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Coverage:</Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  color={stats.dateRange.totalDays === stats.dateRange.expectedDays ? 'success.main' : 'warning.main'}
                >
                  {stats.dateRange.coverage}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Value Statistics:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2">Avg Close Price:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.values.avgClose.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Min/Max Close:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.values.minClose.toFixed(2)} - {stats.values.maxClose.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Avg Volume:</Typography>
                <Typography variant="body1" fontWeight="bold">{stats.values.avgVolume.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
          
          {stats.missingDates.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography color="error">
                  Missing Dates: {stats.missingDates.length} days
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats.missingDates.map(date => (
                    <Typography key={date} variant="body2" sx={{ 
                      p: 0.5, 
                      bgcolor: 'error.light', 
                      borderRadius: 1,
                      color: 'error.contrastText'
                    }}>
                      {date}
                    </Typography>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      )}
      
      {data && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Data Preview</Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Open</TableCell>
                  <TableCell>High</TableCell>
                  <TableCell>Low</TableCell>
                  <TableCell>Close</TableCell>
                  <TableCell>Volume</TableCell>
                  <TableCell>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(data).sort().slice(0, 10).map(dateKey => (
                  <TableRow key={dateKey}>
                    <TableCell>{dateKey}</TableCell>
                    <TableCell>{data[dateKey].open?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{data[dateKey].high?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{data[dateKey].low?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{data[dateKey].close?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{data[dateKey].volume?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{data[dateKey].performance?.toFixed(2) || 'N/A'}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>View Raw Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ 
                maxHeight: 300, 
                overflow: 'auto', 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: 12
              }}>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}
    </Box>
  );
};

export default DataValidator;
