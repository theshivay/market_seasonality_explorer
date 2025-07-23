# Market Seasonality Explorer

A React application that displays an interactive calendar for visualizing historical volatility, liquidity, and performance data across different time periods (day/week/month) for financial instruments.

## Features

- **Interactive Calendar Interface**: Navigate through different time periods and visualize market data
- **Multiple View Modes**: Calendar, heatmap, and performance views
- **Detailed Dashboard**: Access comprehensive market data for any selected date
- **Instrument Selector**: Switch between different financial instruments
- **Rich Data Visualizations**: Charts for price, volume, volatility, and performance metrics

## Tech Stack

- **React**: Frontend framework
- **Material UI**: Component library for UI elements
- **Recharts**: Data visualization library
- **Moment.js**: Date handling
- **Tailwind CSS**: Utility-first CSS framework

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
