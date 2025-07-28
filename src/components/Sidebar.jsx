
import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider } from '@mui/material';
import { CalendarToday, Speed, CheckCircle, NotificationsActive, Close } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const features = [
  { label: 'Market Calendar', icon: <CalendarToday />, route: '/' },
  { label: 'Real-Time Data', icon: <Speed />, route: '/real-time-data' },
  { label: 'Implementation Summary', icon: <CheckCircle />, route: '/implementation-summary' },
  { label: 'Alert System', icon: <NotificationsActive />, route: '/alert-system' },
];

// Sidebar receives optional onClose prop for close button
const Sidebar = ({ onClose }) => {
  const location = useLocation();
  return (
    <Box
      sx={{
        width: { xs: '100vw', sm: 240 },
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1A365D 0%, #2E5077 100%)',
        color: 'white',
        boxShadow: 2,
        position: 'relative',
        zIndex: 100,
        pt: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Close button for mobile/desktop */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end', px: 2 }}>
        <IconButton onClick={onClose} sx={{ color: 'white' }} aria-label="Close sidebar">
          <Close />
        </IconButton>
      </Box>
      <Typography variant="h5" sx={{ px: 3, mb: 2, fontWeight: 700, mt: { xs: 0, sm: 2 } }}>
        Market Explorer
      </Typography>
      <Divider sx={{ background: 'rgba(255,255,255,0.15)', mb: 1 }} />
      <List>
        {features.map((feature) => (
          <ListItemButton
            key={feature.route}
            component={Link}
            to={feature.route}
            selected={location.pathname === feature.route}
            sx={{
              my: 1,
              borderRadius: 2,
              background: location.pathname === feature.route ? 'rgba(255,255,255,0.12)' : 'none',
              '&:hover': { background: 'rgba(255,255,255,0.18)' },
              transition: 'background 0.2s',
              pl: 3,
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{feature.icon}</ListItemIcon>
            <ListItemText primary={feature.label} primaryTypographyProps={{ fontWeight: location.pathname === feature.route ? 700 : 400 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ background: 'rgba(255,255,255,0.10)', my: 1 }} />
      <Box sx={{ px: 3, pb: 2, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
        &copy; {new Date().getFullYear()} Market Explorer
      </Box>
    </Box>
  );
};

export default Sidebar;
