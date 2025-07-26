import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography
} from '@mui/material';
import {
  CurrencyBitcoin,
  TrendingUp,
  PublicRounded,
  BusinessCenter,
  Assessment
} from '@mui/icons-material';

const getAssetIcon = (assetType) => {
  switch (assetType) {
    case 'crypto':
      return <CurrencyBitcoin sx={{ fontSize: 16 }} />;
    case 'stock':
      return <TrendingUp sx={{ fontSize: 16 }} />;
    case 'forex':
      return <PublicRounded sx={{ fontSize: 16 }} />;
    case 'commodity':
      return <BusinessCenter sx={{ fontSize: 16 }} />;
    case 'index':
      return <Assessment sx={{ fontSize: 16 }} />;
    default:
      return <CurrencyBitcoin sx={{ fontSize: 16 }} />;
  }
};

const getAssetColor = (assetType) => {
  switch (assetType) {
    case 'crypto':
      return 'warning';
    case 'stock':
      return 'success';
    case 'forex':
      return 'info';
    case 'commodity':
      return 'secondary';
    case 'index':
      return 'primary';
    default:
      return 'default';
  }
};

const EnhancedInstrumentSelector = ({ 
  instruments, 
  selectedInstrument, 
  onInstrumentChange,
  variant = 'outlined',
  size = 'small',
  fullWidth = false
}) => {
  // Group instruments by category
  const groupedInstruments = instruments.reduce((groups, instrument) => {
    const category = instrument.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(instrument);
    return groups;
  }, {});

  const handleChange = (event) => {
    const instrumentId = event.target.value;
    const instrument = instruments.find(inst => inst.id === instrumentId);
    if (instrument && onInstrumentChange) {
      onInstrumentChange(instrument);
    }
  };

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      <InputLabel id="enhanced-instrument-selector-label">
        Financial Instrument
      </InputLabel>
      <Select
        labelId="enhanced-instrument-selector-label"
        value={selectedInstrument?.id || ''}
        onChange={handleChange}
        label="Financial Instrument"
        renderValue={(value) => {
          const instrument = instruments.find(inst => inst.id === value);
          if (!instrument) return '';
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getAssetIcon(instrument.assetType)}
              <Typography variant="body2">
                {instrument.name}
              </Typography>
              <Chip
                label={instrument.category}
                size="small"
                color={getAssetColor(instrument.assetType)}
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          );
        }}
      >
        {Object.entries(groupedInstruments).map(([category, categoryInstruments]) => [
          <MenuItem key={`header-${category}`} disabled sx={{ opacity: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              {category}
            </Typography>
          </MenuItem>,
          ...categoryInstruments.map((instrument) => (
            <MenuItem key={instrument.id} value={instrument.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getAssetIcon(instrument.assetType)}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    {instrument.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {instrument.symbol} • {instrument.category}
                  </Typography>
                </Box>
                <Chip
                  label={instrument.assetType}
                  size="small"
                  color={getAssetColor(instrument.assetType)}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              </Box>
            </MenuItem>
          ))
        ]).flat()}
      </Select>
    </FormControl>
  );
};

export default EnhancedInstrumentSelector;
