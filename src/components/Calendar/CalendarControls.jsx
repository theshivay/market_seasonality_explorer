import React, { useContext, useState } from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme,
  Menu,
  ListItemText
} from '@mui/material';
import {
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
  ZoomIn,
  ZoomOut,
  FileDownload,
  ColorLens,
  DateRange,
  KeyboardArrowDown
} from '@mui/icons-material';
import moment from 'moment';
import { AppContext } from '../../context/AppContext';

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
    gap: theme.spacing(0.5),
  }
}));

const ControlGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    
    '& .MuiToggleButton-root': {
      padding: '4px 8px', // Smaller padding on mobile for buttons
      minWidth: '40px',
    },
    '& .MuiButton-root': {
      padding: '4px 8px', // Smaller padding on mobile for buttons
      minWidth: '40px',
    },
    '& .MuiFormControl-root': {
      marginBottom: theme.spacing(0.5),
    }
  }
}));

const CalendarControls = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rangeMenuAnchor, setRangeMenuAnchor] = useState(null);
  
  const { 
    viewMode, 
    toggleViewMode, 
    selectedInstrument,
    changeInstrument,
    themeMode,
    changeTheme,
    selectDateRange,
    selectDate
  } = useContext(AppContext);

  // Available financial instruments
  const instruments = [
    { value: 'BTCUSDT', label: 'Bitcoin (BTC/USDT)' },
    { value: 'ETHUSDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'XRPUSDT', label: 'Ripple (XRP/USDT)' },
    { value: 'ADAUSDT', label: 'Cardano (ADA/USDT)' },
    { value: 'SOLUSDT', label: 'Solana (SOL/USDT)' }
  ];

  // Available themes
  const themes = [
    { value: 'default', label: 'Default Theme' },
    { value: 'highContrast', label: 'High Contrast' },
    { value: 'colorblindFriendly', label: 'Colorblind Friendly' }
  ];
  
  // Predefined date ranges
  const predefinedRanges = [
    { 
      label: 'Last 7 Days', 
      value: () => {
        const end = moment();
        const start = moment().subtract(6, 'days');
        return [start, end];
      }
    },
    { 
      label: 'Last 30 Days', 
      value: () => {
        const end = moment();
        const start = moment().subtract(29, 'days');
        return [start, end];
      }
    },
    { 
      label: 'This Month', 
      value: () => {
        const end = moment().endOf('month');
        const start = moment().startOf('month');
        return [start, end];
      }
    },
    { 
      label: 'Last Month', 
      value: () => {
        const end = moment().subtract(1, 'month').endOf('month');
        const start = moment().subtract(1, 'month').startOf('month');
        return [start, end];
      }
    },
    { 
      label: 'Year to Date', 
      value: () => {
        const end = moment();
        const start = moment().startOf('year');
        return [start, end];
      }
    }
  ];

  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      toggleViewMode(newMode);
    }
  };

  // Handle instrument change
  const handleInstrumentChange = (event) => {
    changeInstrument(event.target.value);
  };

  // Handle theme change
  const handleThemeChange = (event) => {
    changeTheme(event.target.value);
  };

  // Handle export (placeholder)
  const handleExport = (format) => {
    console.log(`Export as ${format}`);
    // Implement actual export functionality
  };

  return (
    <ControlsContainer>
      {/* View Mode Selection */}
      <ControlGroup>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size={isMobile ? "small" : "small"}
        >
          <ToggleButton value="daily" aria-label="daily view">
            <Tooltip title="Daily View">
              <CalendarViewDay fontSize={isMobile ? "small" : "medium"} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly view">
            <Tooltip title="Weekly View">
              <CalendarViewWeek fontSize={isMobile ? "small" : "medium"} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly view">
            <Tooltip title="Monthly View">
              <CalendarViewMonth fontSize={isMobile ? "small" : "medium"} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Zoom Controls - Hide on mobile to save space */}
        {!isMobile && (
          <>
            <Tooltip title="Zoom In">
              <Button variant="outlined" size="small">
                <ZoomIn />
              </Button>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Button variant="outlined" size="small">
                <ZoomOut />
              </Button>
            </Tooltip>
          </>
        )}
      </ControlGroup>

      {/* Financial Instrument Selection */}
      <ControlGroup>
        <FormControl size="small" sx={{ minWidth: isMobile ? 110 : 150 }}>
          <InputLabel>{isMobile ? '' : 'Instrument'}</InputLabel>
          <Select
            value={selectedInstrument}
            label={isMobile ? '' : 'Instrument'}
            onChange={handleInstrumentChange}
            sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
          >
            {instruments.map((instrument) => (
              <MenuItem 
                key={instrument.value} 
                value={instrument.value}
                sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
              >
                {isMobile ? instrument.value : instrument.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Theme Selection - Simplified on mobile */}
        <FormControl size="small" sx={{ minWidth: isMobile ? 100 : 150 }}>
          <InputLabel>
            <ColorLens fontSize="small" sx={{ mr: isMobile ? 0 : 1 }} />
            {isMobile ? '' : 'Theme'}
          </InputLabel>
          <Select
            value={themeMode}
            label={isMobile ? '' : 'Theme'}
            onChange={handleThemeChange}
            sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
            startAdornment={isMobile ? null : <ColorLens fontSize="small" sx={{ mr: 1 }} />}
          >
            {themes.map((theme) => (
              <MenuItem 
                key={theme.value} 
                value={theme.value}
                sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}
              >
                {isMobile ? theme.value.slice(0, 3) : theme.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ControlGroup>

      {/* Date Range Selector */}
      <ControlGroup>
        <Button
          variant="outlined"
          startIcon={<DateRange />}
          endIcon={<KeyboardArrowDown />}
          onClick={(event) => setRangeMenuAnchor(event.currentTarget)}
          size="small"
          sx={{ 
            minWidth: isMobile ? '40px' : 'auto',
            px: isMobile ? 1 : 2,
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          {isMobile ? '' : 'Date Range'}
        </Button>
        <Menu
          anchorEl={rangeMenuAnchor}
          open={Boolean(rangeMenuAnchor)}
          onClose={() => setRangeMenuAnchor(null)}
        >
          {predefinedRanges.map((range, index) => (
            <MenuItem 
              key={index} 
              onClick={() => {
                const [start, end] = range.value();
                selectDate(start);
                selectDateRange(start, end);
                setRangeMenuAnchor(null);
              }}
            >
              <ListItemText primary={range.label} />
            </MenuItem>
          ))}
        </Menu>
      </ControlGroup>

      {/* Export Options - Icon only on mobile */}
      <ControlGroup>
        <Button
          variant={isMobile ? "outlined" : "contained"}
          startIcon={isMobile ? null : <FileDownload />}
          onClick={() => handleExport('csv')}
          size="small"
          sx={{ 
            minWidth: isMobile ? '40px' : 'auto',
            px: isMobile ? 1 : 2
          }}
        >
          {isMobile ? <FileDownload fontSize="small" /> : 'Export'}
        </Button>
      </ControlGroup>
    </ControlsContainer>
  );
};

export default CalendarControls;
