import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { AppContextProvider } from './context/AppContextProvider';
import { CustomThemeProvider } from './context/ThemeContext.jsx';
import MarketCalendarPageNew from './pages/MarketCalendarPageNew';
import RealTimeDataDashboard from './components/RealTimeDataDashboard';
import ImplementationSummary from './components/ImplementationSummary';
import AlertSystem from './components/AlertSystem';
import Sidebar from './components/Sidebar';


import React, { useState } from 'react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <CustomThemeProvider>
      <AppContextProvider>
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              backgroundColor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            {/* Sidebar - responsive and professional */}
            <Box
              sx={{
                width: { 
                  xs: sidebarOpen ? '280px' : '0px', 
                  md: sidebarOpen ? '280px' : '0px' 
                },
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                boxShadow: sidebarOpen ? '4px 0 12px rgba(0,0,0,0.15)' : 'none',
                zIndex: 1200,
                position: { xs: 'fixed', md: 'relative' },
                left: 0,
                top: 0,
                height: '100vh',
                background: 'linear-gradient(180deg, #1A365D 0%, #2E5077 100%)',
              }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </Box>

            {/* Main Content Area */}
            <Box
              sx={{
                flex: 1,
                minHeight: '100vh',
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                marginLeft: { xs: 0, md: 0 },
                overflow: 'auto',
              }}
            >
              {/* Sidebar Toggle Button - professional floating button */}
              <Box
                sx={{
                  position: 'fixed',
                  top: { xs: 16, md: 24 },
                  left: { xs: 16, md: sidebarOpen ? 296 : 24 },
                  zIndex: 1300,
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <IconButton
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: 48,
                    height: 48,
                  }}
                  aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                  {sidebarOpen ? '←' : '☰'}
                </IconButton>
              </Box>

              {/* Content with proper spacing */}
              <Box 
                sx={{ 
                  flex: 1,
                  p: { xs: 2, sm: 3, md: 4 }, 
                  pt: { xs: 10, sm: 12, md: 8 },
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Routes>
                  <Route path="/" element={<MarketCalendarPageNew />} />
                  <Route path="/real-time-data" element={<RealTimeDataDashboard />} />
                  <Route path="/implementation-summary" element={<ImplementationSummary />} />
                  <Route path="/alert-system" element={<AlertSystem />} />
                </Routes>
              </Box>
            </Box>

            {/* Mobile overlay */}
            {sidebarOpen && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1100,
                  display: { xs: 'block', md: 'none' },
                }}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </Box>
        </Router>
      </AppContextProvider>
    </CustomThemeProvider>
  );
}

export default App
