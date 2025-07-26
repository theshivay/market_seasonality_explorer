import React, { useState, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import {
  DateRange,
  Clear,
  Analytics,
  CalendarToday,
  TrendingUp,
  Close,
  SelectAll,
  TouchApp
} from '@mui/icons-material';
import moment from 'moment';
import { AppContext } from '../../context/AppContext';

const DateRangeSelector = () => {
  const theme = useTheme();
  const {
    selectedDays,
    dateRange,
    selectionMode,
    setSelectionMode,
    selectDateRange,
    clearSelection,
    analyzeRange
  } = useContext(AppContext);

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [rangeAnalysis, setRangeAnalysis] = useState(null);

  console.log('DateRangeSelector rendering:', { 
    selectionMode, 
    selectedDays: selectedDays?.length, 
    dateRange: dateRange?.start ? `${dateRange.start.format('YYYY-MM-DD')} to ${dateRange.end?.format('YYYY-MM-DD')}` : 'none'
  });

  // Calculate range statistics
  const calculateRangeStats = () => {
    if (selectedDays.length === 0 && !dateRange.start) {
      return null;
    }

    let startDate, endDate, dayCount;
    
    if (selectionMode === 'range' && dateRange.start && dateRange.end) {
      startDate = moment(dateRange.start);
      endDate = moment(dateRange.end);
      dayCount = endDate.diff(startDate, 'days') + 1;
    } else if (selectedDays.length > 0) {
      const dates = selectedDays.map(d => moment(d)).sort((a, b) => a - b);
      startDate = dates[0];
      endDate = dates[dates.length - 1];
      dayCount = selectedDays.length;
    } else {
      return null;
    }

    return {
      startDate: startDate.format('MMM D, YYYY'),
      endDate: endDate.format('MMM D, YYYY'),
      dayCount,
      weekCount: Math.ceil(dayCount / 7),
      span: endDate.diff(startDate, 'days') + 1,
      businessDays: calculateBusinessDays(startDate, endDate)
    };
  };

  const calculateBusinessDays = (start, end) => {
    let count = 0;
    let current = start.clone();
    
    while (current.isSameOrBefore(end, 'day')) {
      if (current.day() !== 0 && current.day() !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.add(1, 'day');
    }
    
    return count;
  };

  const handleAnalyzeClick = async () => {
    const stats = calculateRangeStats();
    if (stats) {
      setRangeAnalysis(stats);
      setAnalysisDialogOpen(true);
      
      // Trigger external analysis callback
      if (analyzeRange) {
        analyzeRange({
          selectionMode,
          selectedDays,
          dateRange,
          stats
        });
      }
    }
  };

  const handleQuickSelect = (period) => {
    const end = moment();
    let start;
    
    switch (period) {
      case '1W':
        start = moment().subtract(7, 'days');
        break;
      case '2W':
        start = moment().subtract(14, 'days');
        break;
      case '1M':
        start = moment().subtract(1, 'month');
        break;
      case '3M':
        start = moment().subtract(3, 'months');
        break;
      case '6M':
        start = moment().subtract(6, 'months');
        break;
      case '1Y':
        start = moment().subtract(1, 'year');
        break;
      default:
        return;
    }
    
    selectDateRange(start, end);
  };

  const stats = calculateRangeStats();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateRange sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            📅 Date Selection & Analysis
          </Typography>
        </Box>
        
        {(selectedDays.length > 0 || (dateRange.start && dateRange.end)) && (
          <Tooltip title="Clear Selection">
            <IconButton 
              onClick={clearSelection} 
              size="small"
              sx={{ 
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '20'
                }
              }}
            >
              <Clear />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Selection Mode Toggle */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
          Selection Mode
        </Typography>
        <ToggleButtonGroup
          value={selectionMode}
          exclusive
          onChange={(e, value) => value && setSelectionMode(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }
          }}
        >
          <ToggleButton value="single" aria-label="single date">
            <CalendarToday sx={{ mr: 1 }} />
            Single
          </ToggleButton>
          <ToggleButton value="multi" aria-label="multiple dates">
            <SelectAll sx={{ mr: 1 }} />
            Multi
          </ToggleButton>
          <ToggleButton value="range" aria-label="date range">
            <TouchApp sx={{ mr: 1 }} />
            Range
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Quick Selection Buttons */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
          Quick Select
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['1W', '2W', '1M', '3M', '6M', '1Y'].map((period) => (
            <Button
              key={period}
              variant="outlined"
              size="small"
              onClick={() => handleQuickSelect(period)}
              sx={{ 
                minWidth: 'auto',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20',
                  borderColor: theme.palette.primary.dark,
                }
              }}
            >
              {period}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Selection Summary */}
      {stats && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
            Selection Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip
              icon={<CalendarToday />}
              label={`${stats.dayCount} day${stats.dayCount !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                backgroundColor: theme.palette.primary.light + '20',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              }}
            />
            <Chip
              label={`${stats.businessDays} business days`}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: theme.palette.secondary.light + '20',
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
              }}
            />
            <Chip
              label={`${stats.weekCount} week${stats.weekCount !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: theme.palette.info.light + '20',
                borderColor: theme.palette.info.main,
                color: theme.palette.info.main,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            <strong>Period:</strong> {stats.startDate} to {stats.endDate}
            {stats.span !== stats.dayCount && (
              <span> (Span: {stats.span} days)</span>
            )}
          </Typography>
        </Box>
      )}

      {/* Analysis Button */}
      {stats && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Analytics />}
            onClick={handleAnalyzeClick}
            sx={{ 
              px: 3,
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
              }
            }}
          >
            Analyze Selected Period
          </Button>
        </Box>
      )}

      {/* Analysis Dialog */}
      <Dialog
        open={analysisDialogOpen}
        onClose={() => setAnalysisDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`
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
            <TrendingUp />
            Range Analysis
          </Box>
          <IconButton 
            onClick={() => setAnalysisDialogOpen(false)}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent 
          dividers
          sx={{ 
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.divider
          }}
        >
          {rangeAnalysis && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    📅 Period Overview
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Start Date:</strong> {rangeAnalysis.startDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>End Date:</strong> {rangeAnalysis.endDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Total Days:</strong> {rangeAnalysis.dayCount}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Business Days:</strong> {rangeAnalysis.businessDays}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Weeks:</strong> {rangeAnalysis.weekCount}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    📊 Analysis Insights
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Selection Type:</strong> {selectionMode === 'range' ? 'Date Range' : 'Multi-Select'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Trading Period:</strong> {rangeAnalysis.businessDays > 20 ? 'Long-term' : rangeAnalysis.businessDays > 5 ? 'Medium-term' : 'Short-term'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                    <strong style={{ color: theme.palette.text.primary }}>Weekend Coverage:</strong> {rangeAnalysis.span - rangeAnalysis.businessDays} weekend days
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    💡 This period contains {Math.round((rangeAnalysis.businessDays / rangeAnalysis.span) * 100)}% trading days
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} align="center">
                  📈 Detailed market analysis for this period will be displayed in the main dashboard
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={() => setAnalysisDialogOpen(false)}
            sx={{ color: theme.palette.text.primary }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setAnalysisDialogOpen(false)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            View in Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DateRangeSelector;
