import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppContextProvider from './context/AppContext.jsx';
import MarketCalendarPage from './pages/MarketCalendarPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <AppContextProvider>
        <Routes>
          <Route path="/calendar" element={<MarketCalendarPage />} />
          <Route path="/" element={<Navigate to="/calendar" />} />
        </Routes>
      </AppContextProvider>
    </Router>
  );
}

export default App;
