import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AppContextProvider } from './context/AppContext'
import MarketCalendarPage from './pages/MarketCalendarPage'
import theme from './theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContextProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<MarketCalendarPage />} />
            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </ThemeProvider>
  )
}

export default App
