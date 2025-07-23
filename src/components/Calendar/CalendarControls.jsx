import React, { useContext } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
  ZoomIn,
  ZoomOut,
  FileDownload,
  ColorLens
} from '@mui/icons-material';
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
  }
}));

const ControlGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
}));

const CalendarControls = () => {
  const { 
    viewMode, 
    toggleViewMode, 
    selectedInstrument,
    changeInstrument,
    themeMode,
    changeTheme
  } = useContext(AppContext);

  // Available financial instruments
  const instruments = [
    { value: 'BTC-USD', label: 'Bitcoin (BTC/USD)' },
    { value: 'ETH-USD', label: 'Ethereum (ETH/USD)' },
    { value: 'XRP-USD', label: 'Ripple (XRP/USD)' },
    { value: 'ADA-USD', label: 'Cardano (ADA/USD)' },
    { value: 'SOL-USD', label: 'Solana (SOL/USD)' }
  ];

  // Available themes
  const themes = [
    { value: 'default', label: 'Default Theme' },
    { value: 'highContrast', label: 'High Contrast' },
    { value: 'colorblindFriendly', label: 'Colorblind Friendly' }
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
          size="small"
        >
          <ToggleButton value="daily" aria-label="daily view">
            <Tooltip title="Daily View">
              <CalendarViewDay />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly view">
            <Tooltip title="Weekly View">
              <CalendarViewWeek />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly view">
            <Tooltip title="Monthly View">
              <CalendarViewMonth />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Zoom Controls */}
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
      </ControlGroup>

      {/* Financial Instrument Selection */}
      <ControlGroup>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Instrument</InputLabel>
          <Select
            value={selectedInstrument}
            label="Instrument"
            onChange={handleInstrumentChange}
          >
            {instruments.map((instrument) => (
              <MenuItem key={instrument.value} value={instrument.value}>
                {instrument.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Theme Selection */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            <ColorLens fontSize="small" sx={{ mr: 1 }} />
            Theme
          </InputLabel>
          <Select
            value={themeMode}
            label="Theme"
            onChange={handleThemeChange}
            startAdornment={<ColorLens fontSize="small" sx={{ mr: 1 }} />}
          >
            {themes.map((theme) => (
              <MenuItem key={theme.value} value={theme.value}>
                {theme.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ControlGroup>

      {/* Export Options */}
      <ControlGroup>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={() => handleExport('csv')}
          size="small"
        >
          Export
        </Button>
      </ControlGroup>
    </ControlsContainer>
  );
};

export default CalendarControls;
