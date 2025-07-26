import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  PictureAsPdf,
  Image,
  TableChart,
  CheckCircle,
  GetApp,
  Code,
  Settings
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ExportButton from '../components/ExportButton';
import exportService from '../services/exportService';

// Sample calendar data for demonstration
const sampleCalendarData = [
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
    events: ['Earnings Release', 'Fed Meeting'],
    seasonalityScore: 8.5,
    notes: 'High volatility day'
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
    notes: 'Market consolidation'
  },
  {
    date: '2024-01-17',
    isMarketOpen: false,
    volatility: 0,
    volume: 0,
    priceChange: 0,
    priceChangePercent: 0,
    high: 0,
    low: 0,
    close: 140.55,
    events: ['Market Holiday'],
    seasonalityScore: 0,
    notes: 'Market closed'
  }
];

const ExportDemo = () => {
  const [exportResults, setExportResults] = useState([]);
  const demoCalendarRef = useRef(null);

  const handleDirectExport = async (type) => {
    try {
      let result;
      
      switch (type) {
        case 'pdf':
          if (!demoCalendarRef.current) {
            throw new Error('Demo calendar element not found');
          }
          result = await exportService.exportToPDF(demoCalendarRef.current, {
            filename: `demo-calendar-${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
          
        case 'image':
          if (!demoCalendarRef.current) {
            throw new Error('Demo calendar element not found');
          }
          result = await exportService.exportToImage(demoCalendarRef.current, {
            filename: `demo-calendar-${new Date().toISOString().split('T')[0]}.png`
          });
          break;
          
        case 'csv':
          result = exportService.exportToCSV(sampleCalendarData, {
            filename: `demo-calendar-data-${new Date().toISOString().split('T')[0]}.csv`
          });
          break;
          
        default:
          throw new Error('Invalid export type');
      }
      
      setExportResults(prev => [...prev, {
        type,
        success: true,
        message: result.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      setExportResults(prev => [...prev, {
        type,
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const clearResults = () => {
    setExportResults([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          📤 Export Functionality Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Test and demonstrate calendar export capabilities
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            color="primary"
          >
            ← Back to Home
          </Button>
          <Button
            component={RouterLink}
            to="/market-calendar"
            variant="contained"
            color="primary"
          >
            📊 Go to Market Calendar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Export Options */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              🎯 Export Options
            </Typography>
            
            <Grid container spacing={3}>
              {/* PDF Export */}
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PictureAsPdf color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">PDF Export</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Export calendar as a printable PDF document with customizable layout and orientation.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Printable" size="small" sx={{ mr: 1 }} />
                      <Chip label="Vector" size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleDirectExport('pdf')}
                      startIcon={<GetApp />}
                    >
                      Export PDF
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* Image Export */}
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Image color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Image Export</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Export calendar as high-quality PNG or JPEG image with customizable resolution.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="High-Res" size="small" sx={{ mr: 1 }} />
                      <Chip label="PNG/JPEG" size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleDirectExport('image')}
                      startIcon={<GetApp />}
                    >
                      Export Image
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* CSV Export */}
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TableChart color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">CSV Export</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Export calendar data as spreadsheet-compatible CSV with all market metrics.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Spreadsheet" size="small" sx={{ mr: 1 }} />
                      <Chip label="Data Rich" size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleDirectExport('csv')}
                      startIcon={<GetApp />}
                    >
                      Export CSV
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Demo Calendar */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              📅 Demo Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This is a sample calendar view that will be exported when you click the export buttons above.
            </Typography>
            
            <Box 
              ref={demoCalendarRef}
              sx={{ 
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                backgroundColor: 'background.paper',
                minHeight: 300
              }}
            >
              <Typography variant="h6" align="center" gutterBottom>
                📊 Market Calendar - January 2024
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {sampleCalendarData.map((day, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        backgroundColor: day.isMarketOpen ? 'success.light' : 'error.light',
                        '& .MuiCardContent-root': { pb: 1 }
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {day.date}
                        </Typography>
                        <Typography variant="body2">
                          Status: {day.isMarketOpen ? 'Open' : 'Closed'}
                        </Typography>
                        {day.isMarketOpen && (
                          <>
                            <Typography variant="body2">
                              Price: ${day.close}
                            </Typography>
                            <Typography variant="body2">
                              Volume: {day.volume.toLocaleString()}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <ExportButton 
                  calendarElement={demoCalendarRef.current}
                  calendarData={sampleCalendarData}
                  variant="button"
                  size="large"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Features & Results */}
        <Grid item xs={12} md={4}>
          {/* Features */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ✨ Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Multiple Formats"
                  secondary="PDF, PNG, JPEG, CSV"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Customizable Settings"
                  secondary="Resolution, format, layout"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="High Quality Output"
                  secondary="Vector PDF, high-res images"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Complete Data Export"
                  secondary="All market metrics included"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Export Results */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                📋 Export Results
              </Typography>
              {exportResults.length > 0 && (
                <Button size="small" onClick={clearResults}>
                  Clear
                </Button>
              )}
            </Box>
            
            {exportResults.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No exports yet. Try the buttons above!
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {exportResults.map((result, index) => (
                  <Alert 
                    key={index}
                    severity={result.success ? 'success' : 'error'}
                    sx={{ mb: 1 }}
                    variant="outlined"
                  >
                    <Typography variant="body2">
                      <strong>{result.type.toUpperCase()}</strong> - {result.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.timestamp}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}
          </Paper>

          {/* Technical Info */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔧 Technical Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Code />
                </ListItemIcon>
                <ListItemText 
                  primary="Libraries Used"
                  secondary="html2canvas, jsPDF, PapaParse"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText 
                  primary="Browser Support"
                  secondary="Modern browsers with FileAPI"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExportDemo;
