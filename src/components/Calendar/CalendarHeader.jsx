import React from 'react';
import { Box, Typography, IconButton, styled } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 0),
  
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  }
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem', // Smaller font on mobile
    textAlign: 'center',
    flex: 1
  }
}));

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, viewMode }) => {
  // Format the header title based on view mode
  const formatHeaderTitle = () => {
    switch (viewMode) {
      case 'daily':
        return currentDate.format('dddd, MMMM D, YYYY');
      case 'weekly':
        const weekStart = currentDate.clone().startOf('week');
        const weekEnd = currentDate.clone().endOf('week');
        return `Week of ${weekStart.format('MMMM D')} - ${weekEnd.format('MMMM D, YYYY')}`;
      case 'monthly':
      default:
        return currentDate.format('MMMM YYYY');
    }
  };

  return (
    <HeaderContainer>
      <IconButton onClick={onPrevMonth} aria-label="Previous month">
        <ChevronLeft />
      </IconButton>
      <HeaderTitle variant="h5" component="h2">
        {formatHeaderTitle()}
      </HeaderTitle>
      <IconButton onClick={onNextMonth} aria-label="Next month">
        <ChevronRight />
      </IconButton>
    </HeaderContainer>
  );
};

export default CalendarHeader;
