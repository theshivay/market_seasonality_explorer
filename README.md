# Market Seasonality Explorer

A React application that displays an interactive calendar for visualizing historical volatility, liquidity, and performance data across different time periods (day/week/month) for financial instruments.

![Market Seasonality Explorer](https://img.shields.io/badge/React-18+-blue) ![Material-UI](https://img.shields.io/badge/Material--UI-Latest-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features Implemented

### 1. Interactive Calendar Component ✅
- ✅ **Custom calendar component** with daily, weekly, and monthly views
- ✅ **Smooth transitions** between different time periods
- ✅ **Navigation** between different months/years with intuitive controls
- ✅ **Today's date highlighting** with visual indicators
- ✅ **Keyboard navigation** support:
  - Arrow keys for date navigation
  - Enter to open detailed view
  - Escape to reset selection
  - Home/End for month boundaries

### 2. Data Visualization Layers ✅
- ✅ **Volatility Heatmap**: Color-coded calendar cells
  - Green shades for low volatility (< 5%)
  - Yellow/Orange shades for medium volatility (5-15%)
  - Red shades for high volatility (> 15%)
- ✅ **Liquidity Indicators**: Visual patterns and metrics
  - Dots pattern for high liquidity
  - Stripes pattern for medium liquidity
  - Gradient pattern for low liquidity
- ✅ **Performance Metrics**: Price change visualization
  - Upward arrows for positive performance (> 2%)
  - Downward arrows for negative performance (< -2%)
  - Neutral indicators for minimal changes

### 3. Multi-Timeframe Support ✅
- ✅ **Daily View**: Detailed metrics per day
  - Intraday price ranges
  - Trading volume and liquidity
  - Price change percentages
- ✅ **Weekly View**: Aggregated weekly summaries
  - Weekly average volatility
  - Total weekly volume
  - Weekly performance summary
- ✅ **Monthly View**: Monthly overview
  - Monthly volatility trends
  - Monthly liquidity patterns
  - Monthly performance highlights

### 4. Interactive Features ✅
- ✅ **Hover Effects**: Detailed tooltips with metrics
- ✅ **Click Interactions**: Date selection for detailed breakdowns
- ✅ **Selection Mode**: Date range selection for custom analysis
- ✅ **Filter Controls**: Multiple filter options
  - Financial instrument selection
  - Time period filters
  - Metric type toggles
  - Visualization layer controls
- ✅ **Zoom Functionality**: Scale calendar for detailed analysis

### 5. Data Dashboard Panel ✅
- ✅ **Comprehensive side panel** with detailed information
- ✅ **Multiple tabs** for different data views:
  - Overview with key metrics
  - Price charts and analysis
  - Volatility calculations
  - Volume and liquidity data
  - **Technical indicators** (NEW)
  - **Benchmark comparison** (NEW)
- ✅ **Interactive charts** using Recharts library
- ✅ **Export capabilities** for data analysis

### 6. Advanced Analytics Features ✅ (NEW)
- ✅ **VIX-like Volatility Index**: Market fear gauge calculation
- ✅ **Moving Averages**: SMA 5, 10, 20, 50 with visual charts
- ✅ **Technical Indicators**: 
  - RSI (Relative Strength Index)
  - Simple Moving Averages with crossover signals
  - Price vs moving average analysis
- ✅ **Benchmark Comparison**:
  - Alpha (excess return) calculation
  - Beta coefficient analysis
  - Performance vs market benchmark
  - Risk metrics (Sharpe ratio, Max drawdown, VaR)
- ✅ **Advanced Volatility Metrics**:
  - Annualized volatility
  - Historical volatility analysis
  - Fear & Greed index integration

## 🛠 Tech Stack

- **Frontend Framework**: React 19.1.0
- **UI Library**: Material-UI (MUI) 7.2.0
- **Charts**: Recharts 3.1.0
- **Styling**: Tailwind CSS 3.4.17 + MUI System
- **Date Handling**: Moment.js 2.30.1
- **Routing**: React Router DOM 7.7.0
- **API Integration**: OKX API (free tier)
- **Build Tool**: Vite 7.0.4

## 🏗 Project Structure

```
src/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.jsx              # Main calendar component
│   │   ├── CalendarCell.jsx          # Individual date cells with visualizations
│   │   ├── CalendarHeader.jsx        # Calendar header with weekdays
│   │   └── DateRangeSelector.jsx     # Date range selection component
│   ├── Dashboard/
│   │   └── Dashboard.jsx             # Detailed data dashboard
│   └── FilterControls.jsx            # Filter and control panel
├── pages/
│   └── MarketCalendarPageNew.jsx     # Main application page
├── context/
│   ├── AppContext.jsx                # Application state context
│   └── AppContextProvider.jsx        # Context provider
├── services/
│   ├── apiService.jsx                # API integration services
│   └── marketDataService.jsx         # Market data processing
├── hooks/
│   └── useMarketData.jsx            # Custom hook for data fetching
├── utils/
│   ├── constants.js                  # Application constants
│   ├── dateUtils.jsx                # Date utility functions
│   ├── dateRangeUtils.js            # Date range utilities
│   ├── errorHandling.js             # Error handling utilities
│   ├── performance.js               # Performance optimization utils
│   └── technicalIndicators.js       # Technical analysis calculations (NEW)
└── theme.js                         # Material-UI theme configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theshivay/market_seasonality_explorer.git
   cd market_seasonality_explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for demo)
   ```bash
   # Create .env file for OKX API (optional)
   VITE_OKX_KEY=your_okx_api_key
   VITE_OKX_SECRET_KEY=your_okx_secret_key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Features Demonstration

### Interactive Calendar
- Navigate between months using arrow buttons or keyboard
- Click on any date to view detailed market data
- Use keyboard shortcuts for quick navigation
- Zoom in/out for better viewing experience

### Data Visualization
- **Volatility Heatmap**: Each calendar cell is color-coded based on volatility levels
- **Volume Bars**: Bottom bars in cells show trading volume
- **Performance Indicators**: Arrows indicate positive/negative performance
- **Liquidity Patterns**: Background patterns show liquidity levels

### Filter Controls
- Switch between different financial instruments (BTC, ETH, ADA, etc.)
- Toggle between daily, weekly, and monthly views
- Enable/disable different visualization layers
- Filter by specific metric types

### Date Range Analysis
- Select custom date ranges for analysis
- Compare performance across different periods
- Export data for external analysis

### Dashboard Analytics
- Comprehensive metrics for selected dates
- Interactive charts and visualizations
- Technical indicators and comparisons
- Historical trend analysis

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

*Note: Real-time data is currently available for cryptocurrencies. Traditional instruments show demo data and can be easily connected to paid APIs.*

## 📱 Responsive Design

- **Mobile-first approach** with responsive breakpoints
- **Touch-friendly interactions** for mobile devices
- **Adaptive layouts** for different screen sizes
- **Optimized performance** for various devices

## 🎨 Design System

- **Material Design 3** principles
- **Consistent color scheme** with theme support
- **Accessibility features** including keyboard navigation
- **Smooth animations** and transitions
- **Professional UI/UX** patterns

## 🔧 Customization

The application is highly customizable:
- **Theme configuration** in `src/theme.js`
- **API endpoints** in `src/utils/constants.js`
- **Visualization colors** in component styles
- **Data sources** can be easily switched

## 📊 Performance Optimizations

- **React.memo** for component optimization
- **Lazy loading** for large datasets
- **Debounced API calls** to reduce requests
- **Efficient re-rendering** with proper state management

## 🐛 Known Issues & Future Enhancements

### ✅ Recently Implemented
- **Multi-Asset Support** - Cryptocurrencies, stocks, forex, commodities, and indices
- **Real-time WebSocket Integration** - Live orderbook and ticker data
- **Enhanced API Service** - Unified data layer for multiple asset types
- **Real-time Dashboard** - Live price monitoring and market depth visualization

### Current Limitations
- Real-time data limited to cryptocurrencies (traditional assets show demo data)
- Some APIs require paid subscriptions for full historical data
- WebSocket connections limited to major exchanges

### Future Enhancements
- **Advanced Technical Analysis** - More technical indicators and charting tools
- **Data Export Features** - CSV, JSON, and PDF export capabilities
- **Portfolio Tracking** - Multi-asset portfolio management
- **Advanced Charting** - Candlestick charts, drawing tools, and advanced visualizations
- **News Integration** - Market news and sentiment analysis
- **Mobile App** - React Native companion app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Author

**Shivam Mishra** - [GitHub Profile](https://github.com/theshivay)

## 🙏 Acknowledgments

- **OKX API** for providing free cryptocurrency market data
- **Material-UI** team for the excellent component library
- **Recharts** for powerful charting capabilities
- **React** community for the amazing ecosystem

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Start development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
  ├── assets/         # Static assets
  ├── components/     # React components
  │   ├── Calendar/   # Calendar-related components
  │   └── Dashboard/  # Dashboard components
  ├── context/        # React context for state management
  ├── hooks/          # Custom React hooks
  ├── pages/          # Page components
  ├── services/       # API/data services
  └── utils/          # Utility functions
```

## Key Components

### Calendar
The calendar component provides different views (day/week/month) for visualizing market data with color-coded cells representing various metrics.

### Dashboard
The dashboard displays detailed information for selected dates, including price charts, volume analysis, volatility metrics, and technical indicators.

### AppContext
Manages global state for the application, handling date navigation, view modes, and instrument selection.

## Data Services

Currently, the application uses mock data generated in the `marketDataService.jsx` file. In a production environment, this would be connected to real market data APIs.

## License

MIT
