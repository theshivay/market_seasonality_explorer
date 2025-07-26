import React from 'react';
import { 
  Grid, 
  Typography, 
  Box,
  useTheme
} from '@mui/material';

const CalendarHeader = ({ viewMode = 'month' }) => {
  const theme = useTheme();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Render day headers for month or week view
  const renderDayHeaders = () => {
    return days.map((day, index) => (
      <Box 
        key={index}
        sx={{
          textAlign: 'center',
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRight: index < 6 ? `1px solid ${theme.palette.divider}` : 'none',
          bgcolor: theme.palette.custom?.calendar?.headerBackground || (
            theme.palette.mode === 'light' 
              ? theme.palette.grey[50] 
              : theme.palette.grey[900]
          ),
          gridColumn: index + 1, // Explicitly set column position
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            color: [0, 6].includes(index) 
              ? theme.palette.error.main 
              : (theme.palette.custom?.calendar?.headerText || theme.palette.text.primary)
          }}
        >
          {day}
        </Typography>
      </Box>
    ));
  };
  
  // Render hour headers for day view
  const renderHourHeaders = () => {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
          gridColumn: '1',
          width: '100%'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Time
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Market Activity
        </Typography>
      </Box>
    );
  };
  
  // Render week header for week view
  const renderWeekHeader = () => {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
          gridColumn: '1',
          width: '100%'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Week Period
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Performance
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Volume
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Volatility
        </Typography>
      </Box>
    );
  };
  
  return (
    <>
      {viewMode === 'day' && renderHourHeaders()}
      {viewMode === 'week' && renderWeekHeader()}
      {viewMode === 'month' && renderDayHeaders()}
    </>
  );
};

export default CalendarHeader;
