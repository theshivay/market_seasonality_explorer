import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppContextProvider } from './context/AppContextProvider'
import { CustomThemeProvider } from './context/ThemeContext.jsx'
import MarketCalendarPageNew from './pages/MarketCalendarPageNew'
import ExportDemo from './pages/ExportDemo'
import ThemeDemo from './pages/ThemeDemo'

function App() {
  return (
    <CustomThemeProvider>
      <AppContextProvider>
        <Router>
          <Box 
            sx={{ 
              minHeight: '100vh', 
              width: '100%', 
              backgroundColor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Routes>
              <Route path="/" element={<MarketCalendarPageNew />} />
              <Route path="/market-calendar" element={<MarketCalendarPageNew />} />
              <Route path="/export-demo" element={<ExportDemo />} />
              <Route path="/theme-demo" element={<ThemeDemo />} />
            </Routes>
          </Box>
        </Router>
      </AppContextProvider>
    </CustomThemeProvider>
  )
}

export default App
