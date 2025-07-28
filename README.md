
# 📊 Market Seasonality Explorer

A sophisticated React application featuring an interactive calendar for visualizing market data, comprehensive theming system, and powerful export capabilities. Built with modern React, Material-UI, and enhanced with real-time data integration.

![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react) ![Material-UI](https://img.shields.io/badge/Material--UI-7.2.0-blue?style=for-the-badge&logo=mui) ![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Key Features

### 🗓️ **Interactive Calendar System**
- **Multi-view Calendar**: Daily, weekly, and monthly views with smooth transitions
- **Theme-aware Design**: Adaptive colors and styling across all themes
- **Keyboard Navigation**: Full arrow key support, Enter/Escape shortcuts
- **Date Range Selection**: Advanced date picking with analysis capabilities, now placed beside the calendar for better usability
- **Volatility Heatmap**: Color-coded cells showing market volatility levels
- **Responsive Design**: Mobile-first approach with touch-friendly interactions and sidebar overlay

### 🎨 **Comprehensive Theming System**
- **5 Built-in Themes**: Default, Dark, Colorblind-friendly, High Contrast, Corporate
- **Dynamic Theme Switching**: Real-time theme changes across all components
- **Accessibility Compliance**: WCAG-compliant color schemes and contrast ratios
- **Custom Theme Provider**: Centralized theme management with persistence
- **Theme Demo Page**: Interactive showcase of all available themes

### 📤 **Advanced Export Functionality**
- **PDF Export**: High-quality calendar exports with full formatting
- **CSV Export**: Structured data export for analysis
- **Image Export**: PNG/JPEG calendar snapshots
- **Export Demo Page**: Comprehensive testing and preview capabilities
- **Multi-format Support**: Various export options for different use cases

### 📊 **Real-time Data Integration**
- **Live Market Data**: Real-time cryptocurrency prices and volumes
- **WebSocket Connections**: Live orderbook and ticker data
- **Multi-asset Support**: Crypto, stocks, forex, commodities, indices
- **Enhanced Instrument Selector**: Categorized asset selection with icons
- **Data Source Toggle**: Switch between live and demo data

### 📈 **Advanced Dashboard & Analytics**
- **Interactive Dashboard**: Comprehensive market data visualization
- **Technical Indicators**: VIX-like volatility, moving averages, RSI
- **Chart Integration**: Recharts-powered interactive visualizations
- **Benchmark Comparison**: Performance analysis against market indices
- **Risk Metrics**: Volatility analysis and risk assessment tools

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React | 19.1.0 |
| **UI Framework** | Material-UI (MUI) | 7.2.0 |
| **Build Tool** | Vite | 7.0.4 |
| **Routing** | React Router DOM | 7.7.0 |
| **Charts** | Recharts | 3.1.0 |
| **Styling** | Tailwind CSS + MUI System | 3.4.17 |
| **Date Handling** | Moment.js | 2.30.1 |
| **PDF Export** | jsPDF | 3.0.1 |
| **Image Export** | html2canvas | 1.4.1 |
| **CSV Export** | PapaParse | 5.5.3 |
| **File Downloads** | FileSaver.js | 2.0.5 |

## 📁 Project Architecture

```
src/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.jsx                    # Main interactive calendar component
│   │   ├── CalendarCell.jsx               # Theme-aware calendar cells with data visualization
│   │   ├── CalendarHeader.jsx             # Calendar header with weekday labels
│   │   ├── DateRangeSelector.jsx          # Advanced date range selection with analysis
│   │   └── WeeklyCalendarCell.jsx         # Specialized cells for weekly view
│   ├── Dashboard/
│   │   └── DashboardSimple.jsx            # Comprehensive data dashboard with charts
│   ├── EnhancedInstrumentSelector.jsx     # Multi-asset instrument picker with categories
│   ├── ExportButton.jsx                   # Export functionality trigger
│   ├── ExportMenu.jsx                     # Export options menu
│   ├── ImplementationSummary.jsx          # Project features overview
│   └── RealTimeDataDashboard.jsx          # Live market data visualization
├── context/
│   ├── AppContext.jsx                     # Main application state context
│   ├── AppContextProvider.jsx            # App state provider with data management
│   ├── ThemeContext.jsx                  # Theme management with 5 built-in themes
│   └── ThemeContextBase.js               # Base theme context definition
├── hooks/
│   ├── useCustomTheme.js                 # Custom theme hook for components
│   └── useMarketData.jsx                 # Market data fetching and management
├── pages/
│   ├── ExportDemo.jsx                    # Export functionality demonstration
│   ├── MarketCalendarPageNew.jsx         # Main application page with navigation
│   └── ThemeDemo.jsx                     # Interactive theme showcase
├── services/
│   ├── apiService.jsx                    # API integration layer
│   ├── exportService.js                 # Export functionality (PDF, CSV, Image)
│   └── marketDataService.jsx            # Market data processing and WebSocket
├── utils/
│   ├── constants.js                      # Application constants and configurations
│   ├── dateUtils.jsx                    # Date manipulation utilities
│   └── technicalIndicators.js           # Financial calculations and indicators
├── App.jsx                               # Root component with theme integration
├── main.jsx                              # Application entry point
├── index.css                             # Global styles
└── theme.js                              # Material-UI theme definitions (5 themes)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (LTS recommended)
- **npm** or **yarn** package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/theshivay/market_seasonality_explorer.git
   cd market_seasonality_explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open application**
   Navigate to `http://localhost:5173` in your browser

## 🔗 API Integration

The application now features **Enhanced Multi-Asset API Integration** supporting multiple financial instruments:

### Cryptocurrency Data (Real-time)
- **CoinGecko API** - Primary source for crypto market data
- **Real-time WebSocket connections** - Live orderbook and ticker data via Binance, Coinbase, OKX
- **Historical price and volume data** - Up to 2 years of daily data
- **Multiple cryptocurrency pairs** - BTC, ETH, SOL, ADA, DOT, XRP, and more

### Traditional Financial Instruments (Demo/API Ready)
- **Stocks** - Major US equities (AAPL, GOOGL, MSFT, AMZN, TSLA, etc.)
- **Forex** - Major currency pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- **Commodities** - Gold, Silver, Oil, Natural Gas, Agricultural products
- **Indices** - S&P 500, NASDAQ 100, Dow Jones, VIX

### Real-time Features ✨
- **Live Price Tickers** - Real-time price updates with 24h change and volume
- **Order Book Data** - Live bid/ask spreads with market depth
- **WebSocket Monitoring** - Connection status and health indicators
- **Multi-Exchange Support** - Binance, Coinbase Pro, OKX WebSocket feeds

## �️ Development & Customization

### Theme Customization
Themes are defined in `src/theme.js` with complete Material-UI integration:

```javascript
// Example theme structure
const customTheme = {
  palette: {
    mode: 'light', // or 'dark'
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
    custom: {
      calendar: {
        cellBackground: '#ffffff',
        volatilityHigh: '#f44336',
        volatilityLow: '#4caf50'
      }
    }
  }
}
```

### Export Configuration
Export settings can be customized in `src/services/exportService.js`:

```javascript
// PDF export options
const pdfOptions = {
  format: 'a4',
  margin: 10,
  filename: 'calendar-export.pdf'
}

// CSV export columns
const csvColumns = ['date', 'volatility', 'volume', 'performance']
```

### API Integration
Add new data sources in `src/services/apiService.jsx`:

```javascript
// Example new API integration
export const fetchCustomData = async (symbol) => {
  const response = await fetch(`/api/custom/${symbol}`)
  return response.json()
}
```

## 🔧 Configuration & Environment

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Optional API keys for enhanced data
VITE_COINGECKO_API_KEY=your_api_key_here
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
VITE_POLYGON_API_KEY=your_polygon_key

# WebSocket configuration
VITE_ENABLE_WEBSOCKET=true
VITE_WS_RECONNECT_INTERVAL=5000
```

### Build Configuration
The project uses Vite with optimized settings in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'charts': ['recharts'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
```

## 🚀 Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📈 Roadmap & Future Enhancements

### Planned Features
- [ ] **Advanced Charting**: Candlestick charts with drawing tools
- [ ] **Portfolio Management**: Multi-asset portfolio tracking
- [ ] **Alert System**: Price and volatility alerts
- [ ] **News Integration**: Market news and sentiment analysis
- [ ] **Mobile App**: React Native companion application
- [ ] **API Rate Limiting**: Smart caching and request optimization
- [ ] **Data Export Enhancements**: Excel format and scheduled exports
- [ ] **Advanced Analytics**: Machine learning price predictions

### Integration Roadmap
- [ ] **Bloomberg API**: Professional market data integration
- [ ] **Alpha Vantage**: Stock market data enhancement
- [ ] **Polygon.io**: Real-time equity and crypto data
- [ ] **News APIs**: Financial news aggregation
- [ ] **Social Sentiment**: Twitter and Reddit sentiment analysis

## 📄 License & Legal

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contributing Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Test across different themes and screen sizes

### Bug Reports
Please use the GitHub issue tracker to report bugs. Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 👥 Authors 

### Main Developer
**Shivam Mishra** - *Full Stack Developer*
- GitHub: [@theshivay](https://github.com/theshivay)
- Project: [Market Seasonality Explorer](https://github.com/theshivay/market_seasonality_explorer)

---

## 📞 Support & Contact

For questions, suggestions, or support:

- **GitHub Issues**: [Report bugs or request features](https://github.com/theshivay/market_seasonality_explorer/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join discussions in GitHub Discussions

---

*Built with ❤️ using React, Material-UI, and modern web technologies*
