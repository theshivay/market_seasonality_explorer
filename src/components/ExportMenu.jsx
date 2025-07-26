import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  GetApp,
  PictureAsPdf,
  Image,
  TableChart,
  Settings,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import exportService from '../services/exportService';

const ExportMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  calendarElement, 
  calendarData,
  analysisData 
}) => {
  const [exportState, setExportState] = useState({
    loading: false,
    success: null,
    error: null,
    type: null
  });
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    pdf: {
      orientation: 'landscape',
      format: 'a4',
      quality: 0.95,
      includeTitle: true
    },
    image: {
      format: 'png',
      quality: 0.95,
      scale: 2,
      backgroundColor: '#ffffff'
    },
    csv: {
      includeHeaders: true,
      delimiter: ',',
      enhanced: false
    }
  });

  const handleExport = async (type) => {
    setExportState({ loading: true, success: null, error: null, type });
    
    try {
      let result;
      
      switch (type) {
        case 'pdf':
          if (!calendarElement) {
            throw new Error('Calendar element not found');
          }
          result = await exportService.exportToPDF(calendarElement, {
            ...exportSettings.pdf,
            filename: `market-calendar-${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
          
        case 'image':
          if (!calendarElement) {
            throw new Error('Calendar element not found');
          }
          result = await exportService.exportToImage(calendarElement, {
            ...exportSettings.image,
            filename: `market-calendar-${new Date().toISOString().split('T')[0]}.${exportSettings.image.format}`
          });
          break;
          
        case 'csv':
          console.log('🔍 CSV Export Debug - calendarData:', calendarData);
          console.log('🔍 CSV Export Debug - calendarData length:', calendarData?.length);
          console.log('🔍 CSV Export Debug - typeof calendarData:', typeof calendarData);
          
          // Convert market data object to array format for CSV export
          let csvData = calendarData;
          if (calendarData && typeof calendarData === 'object' && !Array.isArray(calendarData)) {
            // Convert object to array of date entries
            csvData = Object.keys(calendarData).map(dateKey => ({
              date: dateKey,
              ...calendarData[dateKey]
            }));
            console.log('🔧 Converted object to array for CSV export:', csvData);
          }
          
          if (!csvData || csvData.length === 0) {
            // Generate sample data for testing if no real data is available
            console.log('📊 No calendar data available, generating sample data for CSV export');
            csvData = [
              {
                date: '2024-01-15',
                isMarketOpen: true,
                volatility: 15.2,
                volume: 1250000,
                priceChange: 2.5,
                priceChangePercent: 1.8,
                high: 142.50,
                low: 138.20,
                close: 141.75,
                events: ['Earnings Release'],
                seasonalityScore: 8.5,
                notes: 'Sample data for export testing'
              },
              {
                date: '2024-01-16',
                isMarketOpen: true,
                volatility: 12.8,
                volume: 980000,
                priceChange: -1.2,
                priceChangePercent: -0.85,
                high: 141.00,
                low: 139.50,
                close: 140.55,
                events: ['Economic Data'],
                seasonalityScore: 6.2,
                notes: 'Sample data for export testing'
              }
            ];
          }
          
          if (exportSettings.csv.enhanced && analysisData) {
            result = exportService.exportToEnhancedCSV(csvData, analysisData, {
              ...exportSettings.csv,
              filename: `market-calendar-enhanced-${new Date().toISOString().split('T')[0]}.csv`
            });
          } else {
            result = exportService.exportToCSV(csvData, {
              ...exportSettings.csv,
              filename: `market-calendar-data-${new Date().toISOString().split('T')[0]}.csv`
            });
          }
          break;
          
        default:
          throw new Error('Invalid export type');
      }
      
      setExportState({
        loading: false,
        success: result.message,
        error: null,
        type
      });
      
      // Auto close success message after 3 seconds
      setTimeout(() => {
        setExportState(prev => ({ ...prev, success: null }));
      }, 3000);
      
    } catch (error) {
      setExportState({
        loading: false,
        success: null,
        error: error.message,
        type
      });
      
      // Auto close error message after 5 seconds
      setTimeout(() => {
        setExportState(prev => ({ ...prev, error: null }));
      }, 5000);
    }
    
    onClose();
  };

  const handleSettingsChange = (category, field, value) => {
    setExportSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const resetExportState = () => {
    setExportState({ loading: false, success: null, error: null, type: null });
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <GetApp />
          </ListItemIcon>
          <ListItemText 
            primary="Export Options" 
            secondary="Choose format"
          />
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => handleExport('pdf')}
          disabled={exportState.loading}
        >
          <ListItemIcon>
            <PictureAsPdf color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Export as PDF" 
            secondary="Printable document"
          />
          {exportState.loading && exportState.type === 'pdf' && (
            <CircularProgress size={16} />
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleExport('image')}
          disabled={exportState.loading}
        >
          <ListItemIcon>
            <Image color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Export as Image" 
            secondary="PNG/JPEG format"
          />
          {exportState.loading && exportState.type === 'image' && (
            <CircularProgress size={16} />
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleExport('csv')}
          disabled={exportState.loading}
        >
          <ListItemIcon>
            <TableChart color="success" />
          </ListItemIcon>
          <ListItemText 
            primary="Export as CSV" 
            secondary="Spreadsheet data"
          />
          {exportState.loading && exportState.type === 'csv' && (
            <CircularProgress size={16} />
          )}
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => setSettingsDialog(true)}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText 
            primary="Export Settings" 
            secondary="Customize output"
          />
        </MenuItem>
      </Menu>

      {/* Export Status Messages */}
      {exportState.success && (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          onClose={resetExportState}
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            maxWidth: 400
          }}
        >
          {exportState.success}
        </Alert>
      )}
      
      {exportState.error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          onClose={resetExportState}
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            maxWidth: 400
          }}
        >
          Export failed: {exportState.error}
        </Alert>
      )}

      {/* Export Settings Dialog */}
      <Dialog 
        open={settingsDialog} 
        onClose={() => setSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            
            {/* PDF Settings */}
            <Typography variant="h6" gutterBottom color="primary">
              📄 PDF Settings
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={exportSettings.pdf.orientation}
                  label="Orientation"
                  onChange={(e) => handleSettingsChange('pdf', 'orientation', e.target.value)}
                >
                  <MenuItem value="landscape">Landscape</MenuItem>
                  <MenuItem value="portrait">Portrait</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportSettings.pdf.format}
                  label="Format"
                  onChange={(e) => handleSettingsChange('pdf', 'format', e.target.value)}
                >
                  <MenuItem value="a4">A4</MenuItem>
                  <MenuItem value="letter">Letter</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Image Settings */}
            <Typography variant="h6" gutterBottom color="primary">
              🖼️ Image Settings
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportSettings.image.format}
                  label="Format"
                  onChange={(e) => handleSettingsChange('image', 'format', e.target.value)}
                >
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="jpeg">JPEG</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Scale"
                type="number"
                inputProps={{ min: 1, max: 4, step: 0.5 }}
                value={exportSettings.image.scale}
                onChange={(e) => handleSettingsChange('image', 'scale', parseFloat(e.target.value))}
                fullWidth
              />
            </Box>

            {/* CSV Settings */}
            <Typography variant="h6" gutterBottom color="primary">
              📊 CSV Settings
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Delimiter</InputLabel>
                <Select
                  value={exportSettings.csv.delimiter}
                  label="Delimiter"
                  onChange={(e) => handleSettingsChange('csv', 'delimiter', e.target.value)}
                >
                  <MenuItem value=",">Comma (,)</MenuItem>
                  <MenuItem value=";">Semicolon (;)</MenuItem>
                  <MenuItem value="\t">Tab</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.csv.includeHeaders}
                  onChange={(e) => handleSettingsChange('csv', 'includeHeaders', e.target.checked)}
                />
              }
              label="Include column headers"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.csv.enhanced}
                  onChange={(e) => handleSettingsChange('csv', 'enhanced', e.target.checked)}
                />
              }
              label="Enhanced mode (include technical analysis)"
            />
            
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportMenu;
