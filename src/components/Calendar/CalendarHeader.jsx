import React from 'react';
import { 
  Grid, 
  Typography, 
  Box,
  useTheme
} from '@mui/material';
import moment from 'moment';

const CalendarHeader = ({ viewMode = 'month' }) => {
  const theme = useTheme();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Render day headers for month or week view
  const renderDayHeaders = () => {
    return days.map((day, index) => (
      <Grid 
        key={index}
        sx={{
          textAlign: 'center',
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRight: index < 6 ? `1px solid ${theme.palette.divider}` : 'none',
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            color: [0, 6].includes(index) 
              ? theme.palette.error.main 
              : theme.palette.text.primary
          }}
        >
          {day}
        </Typography>
      </Grid>
    ));
  };
  
  // Render hour headers for day view
  const renderHourHeaders = () => {
    return (
      <Grid 
        item 
        xs={12}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Time
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Market Activity
        </Typography>
      </Grid>
    );
  };
  
  return (
    <>
      {viewMode === 'day' ? renderHourHeaders() : renderDayHeaders()}
    </>
  );
};

export default CalendarHeader;
