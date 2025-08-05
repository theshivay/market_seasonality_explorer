
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
        width: '280px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1A365D 0%, #2E5077 50%, #1A365D 100%)',
        color: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header Section */}
      <Box 
        sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
        }}
      >
        {/* Close button for mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mb: 2 }}>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }} 
            aria-label="Close sidebar"
          >
            <Close />
          </IconButton>
        </Box>
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FFFFFF 30%, #E2E8F0 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          Market Explorer
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            display: 'block',
            mt: 0.5,
            letterSpacing: 0.5,
          }}
        >
          Professional Analytics
        </Typography>
      </Box>

      {/* Navigation Section */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {features.map((feature) => (
            <ListItemButton
              key={feature.route}
              component={Link}
              to={feature.route}
              selected={location.pathname === feature.route}
              sx={{
                my: 1,
                borderRadius: 3,
                background: location.pathname === feature.route 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
                  : 'transparent',
                backdropFilter: location.pathname === feature.route ? 'blur(10px)' : 'none',
                border: location.pathname === feature.route 
                  ? '1px solid rgba(255,255,255,0.2)' 
                  : '1px solid transparent',
                '&:hover': { 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pl: 2.5,
                py: 1.5,
                minHeight: 56,
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === feature.route ? '#E2E8F0' : 'rgba(255,255,255,0.8)',
                  minWidth: 40,
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                {feature.icon}
              </ListItemIcon>
              <ListItemText 
                primary={feature.label} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === feature.route ? 600 : 500,
                  fontSize: '0.95rem',
                  color: location.pathname === feature.route ? '#FFFFFF' : 'rgba(255,255,255,0.9)',
                }} 
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box 
        sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
            letterSpacing: 0.5,
          }}
        >
          &copy; {new Date().getFullYear()} Market Explorer
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.7rem',
            display: 'block',
            mt: 0.5,
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
