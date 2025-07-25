import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material'
import { AppContextProvider } from './context/AppContext'
import MarketCalendarPage from './pages/MarketCalendarPage'
import DataValidator from './components/DataValidation/DataValidator'
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
              <Route path="/" element={<MarketCalendarPage />} />
              <Route path="/validate-data" element={<DataValidator />} />
            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </ThemeProvider>
  )
}

export default App
