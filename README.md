# TradeVision Stock Charts

A modern, interactive stock chart application built with React, TypeScript, and Highcharts. This application provides real-time stock data visualization with candlestick charts, moving averages, and volume analysis.

## Features

- **Interactive Candlestick Charts**: View stock price movements with OHLC (Open, High, Low, Close) data
- **Multiple Moving Averages**: Toggle between SMA 20, 50, 150, and 200 day moving averages
- **Volume Analysis**: View trading volume alongside price data
- **Time Period Selection**: Choose from predefined periods (1D, 1W, 1M, 3M, 6M, 1Y, 2Y)
- **Multiple Stocks**: Support for IBM, AAPL, MSFT, and GOOGL
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Price Updates**: Hover over chart to see detailed price information

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Charting**: Highcharts (candlestick, line, and column charts)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Data**: Mock data with realistic stock patterns

## Project Structure

```
src/
├── components/
│   ├── Chart/
│   │   ├── StockChart.tsx      # Main chart component
│   │   ├── ChartControls.tsx   # Stock/period/SMA controls
│   │   └── PriceDisplay.tsx    # Price information display
│   └── UI/
│       ├── Button.tsx          # Reusable button component
│       └── Select.tsx          # Reusable select component
├── data/
│   └── mockData.ts             # Mock stock data generation
├── hooks/
│   └── useStockData.ts         # Custom hook for data management
├── types/
│   ├── stock.types.ts          # Stock data type definitions
│   └── chart.types.ts          # Chart configuration types
├── utils/
│   ├── calculations.ts         # Financial calculations (SMA, etc.)
│   └── chartHelpers.ts         # Highcharts configuration helpers
└── constants/
    ├── colors.ts               # Color scheme definitions
    ├── periods.ts              # Time period definitions
    └── chartConfig.ts          # Default chart configurations
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd high-charts-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5175`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Select a Stock**: Choose from IBM, AAPL, MSFT, or GOOGL from the dropdown
2. **Choose Time Period**: Select from 1D, 1W, 1M, 3M, 6M, 1Y, or 2Y
3. **Toggle Moving Averages**: Click on SMA buttons to show/hide moving average lines
4. **View Price Details**: Hover over the chart to see OHLCV data and SMA values
5. **Analyze Volume**: Volume bars are displayed below the main price chart

## Key Features Explained

### Candlestick Charts
- Green candles: Close > Open (price increased)
- Red candles: Close < Open (price decreased)
- Wicks show high and low prices for the period

### Moving Averages
- **SMA 20**: Short-term trend indicator
- **SMA 50**: Medium-term trend indicator  
- **SMA 150**: Long-term trend indicator
- **SMA 200**: Major trend indicator

### Volume Analysis
- Volume bars are color-coded to match candlestick direction
- Higher volume often indicates stronger price movements

## Data Sources

Currently using realistic mock data with:
- 2 years of daily OHLCV data
- Different volatility patterns for each stock
- Realistic price movements and volume patterns

## Future Enhancements

- Real-time data integration (Alpha Vantage, Yahoo Finance APIs)
- Additional technical indicators (RSI, MACD, Bollinger Bands)
- Price alerts and notifications
- Portfolio tracking
- Export functionality
- Dark mode theme

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Highcharts for the excellent charting library
- React team for the amazing framework
- Tailwind CSS for the utility-first styling approach
