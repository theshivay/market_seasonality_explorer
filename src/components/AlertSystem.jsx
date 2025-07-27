import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Badge,
  Alert,
  Snackbar,
  Slider,
  Divider,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Add,
  NotificationsActive,
  Close,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  ShowChart,
  VolumeUp,
  Stop,
  PlayArrow,
  Pause,
  Settings,
  Help
} from '@mui/icons-material';

import { useTheme } from '@mui/material';
import { AppContext } from '../context/AppContext';
import useMarketData from '../hooks/useMarketData';
import moment from 'moment';

const AlertSystem = ({ open = true, onClose = null }) => {
  const theme = useTheme();
  const { data: marketData } = useMarketData();

  const [alerts, setAlerts] = useState([]);
  const [alertDialog, setAlertDialog] = useState({ open: false, alert: null, mode: 'create' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'price',
    condition: 'above',
    threshold: '',
    timeframe: 'daily',
    enabled: true,
    description: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [monitoring, setMonitoring] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio context for sound notifications
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  // Browser notification request
  useEffect(() => {
    if (notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notifications]);

  // Alert templates
  const alertTemplates = [
    {
      name: 'Price Breakout Alert',
      type: 'price',
      condition: 'above',
      threshold: '100',
      timeframe: 'daily',
      description: 'Triggers when price breaks above threshold'
    },
    {
      name: 'Volatility Spike Alert',
      type: 'volatility',
      condition: 'above',
      threshold: '25',
      timeframe: 'daily',
      description: 'Triggers when volatility exceeds 25%'
    },
    {
      name: 'Volume Spike Alert',
      type: 'volume',
      condition: 'above',
      threshold: '150',
      timeframe: 'daily',
      description: 'Triggers when volume is 150% above average'
    }
  ];

  // Initialize with some default alerts
  useEffect(() => {
    if (alerts.length === 0) {
      setAlerts([
        {
          id: 1,
          name: 'SPY Price Alert',
          type: 'price',
          condition: 'above',
          threshold: '450',
          timeframe: 'daily',
          enabled: true,
          triggered: false,
          description: 'Alert when SPY goes above $450',
          createdAt: new Date(),
          lastChecked: new Date()
        },
        {
          id: 2,
          name: 'Market Volatility',
          type: 'volatility',
          condition: 'above',
          threshold: '30',
          timeframe: 'daily',
          enabled: true,
          triggered: false,
          description: 'Alert when volatility exceeds 30%',
          createdAt: new Date(),
          lastChecked: new Date()
        }
      ]);
    }
  }, [alerts.length]);

  // Monitor alerts against market data
  useEffect(() => {
    if (!monitoring || !marketData || alerts.length === 0) return;

    const checkAlerts = () => {
      const now = new Date();
      let triggeredCount = 0;

      const updatedAlerts = alerts.map(alert => {
        if (!alert.enabled || alert.triggered) return alert;

        let shouldTrigger = false;
        let currentValue = 0;

        // Simulate alert checking logic
        switch (alert.type) {
          case 'price':
            currentValue = Math.random() * 500; // Simulated price
            break;
          case 'volatility':
            currentValue = Math.random() * 50; // Simulated volatility %
            break;
          case 'volume':
            currentValue = Math.random() * 200; // Simulated volume %
            break;
          case 'performance':
            currentValue = Math.random() * 20 - 10; // Simulated performance %
            break;
          default:
            break;
        }

        // Check condition
        switch (alert.condition) {
          case 'above':
            shouldTrigger = currentValue > parseFloat(alert.threshold);
            break;
          case 'below':
            shouldTrigger = currentValue < parseFloat(alert.threshold);
            break;
          case 'equals':
            shouldTrigger = Math.abs(currentValue - parseFloat(alert.threshold)) < 0.01;
            break;
          default:
            break;
        }

        if (shouldTrigger) {
          triggeredCount++;
          
          // Show notification
          if (notifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`Alert: ${alert.name}`, {
              body: `${alert.type} is ${alert.condition} ${alert.threshold}`,
              icon: '/favicon.ico'
            });
          }

          // Play sound
          playNotificationSound();

          // Show snackbar
          setSnackbar({
            open: true,
            message: `Alert triggered: ${alert.name}`,
            severity: 'warning'
          });

          return {
            ...alert,
            triggered: true,
            triggeredAt: now,
            lastChecked: now
          };
        }

        return {
          ...alert,
          lastChecked: now
        };
      });

      if (triggeredCount > 0) {
        setAlerts(updatedAlerts);
      }
    };

    const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [monitoring, marketData, alerts, notifications, playNotificationSound]);

  const handleCreateAlert = () => {
    setFormData({
      name: '',
      type: 'price',
      condition: 'above',
      threshold: '',
      timeframe: 'daily',
      enabled: true,
      description: ''
    });
    setAlertDialog({ open: true, alert: null, mode: 'create' });
  };

  const handleEditAlert = (alert) => {
    setFormData({
      name: alert.name,
      type: alert.type,
      condition: alert.condition,
      threshold: alert.threshold,
      timeframe: alert.timeframe,
      enabled: alert.enabled,
      description: alert.description || ''
    });
    setAlertDialog({ open: true, alert, mode: 'edit' });
  };

  const handleSaveAlert = () => {
    if (!formData.name || !formData.threshold) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    const alertData = {
      ...formData,
      id: alertDialog.alert?.id || Date.now(),
      triggered: false,
      createdAt: alertDialog.alert?.createdAt || new Date(),
      lastChecked: new Date()
    };

    if (alertDialog.mode === 'create') {
      setAlerts(prev => [...prev, alertData]);
      setSnackbar({
        open: true,
        message: 'Alert created successfully',
        severity: 'success'
      });
    } else {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertDialog.alert.id ? alertData : alert
      ));
      setSnackbar({
        open: true,
        message: 'Alert updated successfully',
        severity: 'success'
      });
    }

    setAlertDialog({ open: false, alert: null, mode: 'create' });
  };

  const handleDeleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSnackbar({
      open: true,
      message: 'Alert deleted successfully',
      severity: 'info'
    });
  };

  const handleToggleAlert = (alertId, enabled) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, enabled, triggered: false } : alert
    ));
  };

  const clearTriggeredAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, triggered: false })));
    setSnackbar({
      open: true,
      message: 'All triggered alerts cleared',
      severity: 'info'
    });
  };

  const applyTemplate = (template) => {
    setFormData({
      ...template,
      enabled: true
    });
    setAlertDialog({ open: true, alert: null, mode: 'create' });
  };

  const getUnit = (type) => {
    switch (type) {
      case 'price': return '($)';
      case 'volatility': return '(%)';
      case 'volume': return '(%)';
      case 'performance': return '(%)';
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'price': return <ShowChart />;
      case 'volatility': return <TrendingUp />;
      case 'volume': return <VolumeUp />;
      case 'performance': return <TrendingDown />;
      default: return <NotificationsActive />;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.enabled);
  const triggeredAlerts = alerts.filter(alert => alert.triggered);

  // Alert Status Component for tab content
  const AlertContent = () => (
    <Box sx={{ p: 3 }}>
      {/* Status Overview */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
          Alert System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Global Monitoring">
            <IconButton 
              onClick={() => setMonitoring(!monitoring)}
              color={monitoring ? 'success' : 'default'}
            >
              {monitoring ? <PlayArrow /> : <Pause />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Browser Notifications">
            <IconButton 
              onClick={() => setNotifications(!notifications)}
              color={notifications ? 'primary' : 'default'}
            >
              <NotificationsActive />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sound Alerts">
            <IconButton 
              onClick={() => setSoundEnabled(!soundEnabled)}
              color={soundEnabled ? 'primary' : 'default'}
            >
              <VolumeUp />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{alerts.length}</Typography>
                  <Typography variant="body2">Total Alerts</Typography>
                </Box>
                <NotificationsActive sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.success.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{activeAlerts.length}</Typography>
                  <Typography variant="body2">Active Alerts</Typography>
                </Box>
                <PlayArrow sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: theme.palette.warning.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{triggeredAlerts.length}</Typography>
                  <Typography variant="body2">Triggered</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: monitoring ? theme.palette.success.main : theme.palette.error.main, 
            color: 'white' 
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{monitoring ? 'Active' : 'Paused'}</Typography>
                  <Typography variant="body2">Monitoring</Typography>
                </Box>
                {monitoring ? 
                  <PlayArrow sx={{ fontSize: 40, opacity: 0.7 }} /> : 
                  <Pause sx={{ fontSize: 40, opacity: 0.7 }} />
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Quick Actions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateAlert}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Create Alert
          </Button>
          {triggeredAlerts.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={clearTriggeredAlerts}
              color="warning"
            >
              Clear Triggered ({triggeredAlerts.length})
            </Button>
          )}
        </Box>
      </Paper>

      {/* Alert List */}
      <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Active Alerts
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {alerts.length} alerts configured
          </Typography>
        </Box>
        
        {alerts.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No alerts configured. Create your first alert to start monitoring market conditions.
          </Alert>
        ) : (
          <List>
            {alerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem sx={{ 
                  backgroundColor: alert.triggered ? 
                    theme.palette.warning.light + '20' : 
                    'transparent',
                  borderRadius: 1,
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(alert.type)}
                    <Box sx={{ color: alert.triggered ? theme.palette.warning.main : 'inherit' }}>
                      <Badge
                        variant="dot"
                        color={alert.triggered ? "error" : "default"}
                        invisible={!alert.triggered}
                      >
                        {getTypeIcon(alert.type)}
                      </Badge>
                    </Box>
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: alert.triggered ? 
                              theme.palette.warning.main : 
                              theme.palette.text.primary,
                            fontWeight: alert.triggered ? 'bold' : 'normal'
                          }}
                        >
                          {alert.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {alert.triggered && (
                            <Chip 
                              label="TRIGGERED" 
                              color="warning" 
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          )}
                          <Chip 
                            label={alert.type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${alert.condition} ${alert.threshold}${getUnit(alert.type)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Created: {moment(alert.createdAt).format('MMM DD, HH:mm')} | 
                          Last checked: {moment(alert.lastChecked).format('HH:mm:ss')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Switch
                        checked={alert.enabled}
                        onChange={(e) => handleToggleAlert(alert.id, e.target.checked)}
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleEditAlert(alert)}
                        size="small"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteAlert(alert.id)}
                        size="small"
                        sx={{ color: theme.palette.error.main }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < alerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Gap between Active Alerts and Quick Templates */}
      <Box sx={{ height: 32 }} />
      {/* Quick Templates */}
      <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Quick Templates
        </Typography>
        <Grid container spacing={2}>
          {alertTemplates.map((template, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: theme.palette.action.hover 
                }
              }}>
                <CardContent onClick={() => applyTemplate(template)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getTypeIcon(template.type)}
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`${template.condition} ${template.threshold}${getUnit(template.type)}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );

  // Main component render
  return (
    <React.Fragment>
      {/* Render differently based on whether it's used as a dialog or tab content */}
      {onClose ? (
        // Dialog mode (when onClose is provided)
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              minHeight: '80vh'
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
              <Badge badgeContent={activeAlerts.length} color="error">
                <NotificationsActive />
              </Badge>
              <Typography variant="h6">Alert System</Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ color: theme.palette.primary.contrastText }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <AlertContent />
          </DialogContent>
        </Dialog>
      ) : (
        // Tab content mode (when onClose is not provided)
        <AlertContent />
      )}

      {/* Alert Creation/Edit Dialog */}
      <Dialog
        open={alertDialog.open}
        onClose={() => setAlertDialog({ open: false, alert: null, mode: 'create' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {alertDialog.mode === 'create' ? 'Create New Alert' : 'Edit Alert'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Alert Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={formData.type}
                label="Alert Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="volatility">Volatility</MenuItem>
                <MenuItem value="volume">Volume</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={formData.condition}
                label="Condition"
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <MenuItem value="above">Above</MenuItem>
                <MenuItem value="below">Below</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={`Threshold ${getUnit(formData.type)}`}
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={formData.timeframe}
                label="Timeframe"
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="Enable Alert"
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog({ open: false, alert: null, mode: 'create' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveAlert} variant="contained">
            {alertDialog.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default AlertSystem;