import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
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
              maxWidth: '100vw',
              backgroundColor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row-reverse' },
            }}
          >
            {/* Right-side Sidebar - overlays on mobile, fixed on desktop */}
            <Box
              sx={{
                width: { xs: sidebarOpen ? '100vw' : 0, sm: sidebarOpen ? 240 : 0 },
                transition: 'width 0.3s',
                overflow: 'hidden',
                boxShadow: sidebarOpen ? 3 : 0,
                zIndex: 1200,
                position: { xs: 'fixed', sm: 'relative' },
                right: 0,
                top: 0,
                height: '100vh',
                background: 'linear-gradient(180deg, #1A365D 0%, #2E5077 100%)',
                display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
              }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </Box>
            {/* Main Content */}
            <Box
              sx={{
                flex: 1,
                minHeight: '100vh',
                position: 'relative',
                width: '100%',
                transition: 'filter 0.3s',
                filter: { xs: sidebarOpen ? 'blur(2px) brightness(0.8)' : 'none', sm: 'none' },
                pointerEvents: { xs: sidebarOpen ? 'none' : 'auto', sm: 'auto' },
              }}
            >
              {/* Sidebar Toggle Button - always visible on mobile, floats on desktop */}
              <Box
                sx={{
                  position: 'fixed',
                  top: 16,
                  right: { xs: 16, sm: sidebarOpen ? 240 : 0 },
                  zIndex: 1300,
                  display: 'flex',
                }}
              >
                {/* <button
                  onClick={() => setSidebarOpen((open) => !open)}
                  className="bg-blue-600 text-white rounded-l px-3 py-2 shadow hover:bg-blue-700 focus:outline-none"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                  {sidebarOpen ? '→' : '☰'}
                </button> */}
              </Box>
              <Box sx={{ p: { xs: 1, sm: 3 }, pt: { xs: 8, sm: 6 } }}>
                <Routes>
                  <Route path="/" element={<MarketCalendarPageNew />} />
                  <Route path="/real-time-data" element={<RealTimeDataDashboard />} />
                  <Route path="/implementation-summary" element={<ImplementationSummary />} />
                  <Route path="/alert-system" element={<AlertSystem />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </AppContextProvider>
    </CustomThemeProvider>
  );
}

export default App
