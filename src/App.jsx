import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material'
import { AppContextProvider } from './context/AppContextProvider'
import MarketCalendarPageNew from './pages/MarketCalendarPageNew'
import ExportDemo from './pages/ExportDemo'
import theme from './theme'

// Create responsive theme with automatic font scaling
const responsiveTheme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={responsiveTheme}>
      <CssBaseline />
      <AppContextProvider>
        <Router>
          <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Routes>
              <Route path="/" element={<MarketCalendarPageNew />} />
              <Route path="/market-calendar" element={<MarketCalendarPageNew />} />
              <Route path="/export-demo" element={<ExportDemo />} />
            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </ThemeProvider>
  )
}

export default App
