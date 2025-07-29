import { differenceInDays, addDays, format } from 'date-fns';

import type { StockData, OHLCV, ChartPeriod } from '../types/stock.types';

const STOCK_CONFIGS = {
  IBM: { startPrice: 180, volatility: 0.02, trend: 0.0001, baseVolume: 8000000 },
  AAPL: { startPrice: 280, volatility: 0.025, trend: 0.0002, baseVolume: 12000000 },
};

const DAYS_MAP: Record<Exclude<ChartPeriod, '1D'>, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '2Y': 730,
};

const isSupportedTicker = (ticker: string): ticker is keyof typeof STOCK_CONFIGS => {
  return ticker in STOCK_CONFIGS;
};

/**
 * Checks if current time is within market hours (Monday-Friday, 9 AM - 4 PM)
 */
export const isMarketHours = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  return day >= 1 && day <= 5 && hour >= 9 && hour <= 16;
};

const getCurrentMarketHour = (): number => {
  const hour = new Date().getHours();
  return Math.min(Math.max(hour, 9), 16);
};

/**
 * Creates a single OHLCV (Open, High, Low, Close, Volume) data point
 * with realistic price movements and volume variations
 */
const createOHLCV = (
  date: Date,
  open: number,
  change: number,
  baseVolume: number,
  formatString: string
): OHLCV => {
  const close = open * (1 + change);
  const high = Math.max(open, close) + Math.random() * 0.8;
  const low = Math.min(open, close) - Math.random() * 0.8;
  const volume = baseVolume * (0.8 + Math.random() * 0.4);

  return {
    date: format(date, formatString),
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume: Math.floor(volume),
  };
};

/**
 * Generates intraday data for a specific ticker with hourly data points
 * Can generate either historical data or live data based on market hours
 */
const generate1DayData = (ticker: string, isLive = false, lastPrice?: number): OHLCV[] => {
  if (!isSupportedTicker(ticker)) return [];
  const config = STOCK_CONFIGS[ticker];

  const data: OHLCV[] = [];
  let currentPrice = lastPrice || config.startPrice;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const marketHours = [9, 10, 11, 12, 13, 14, 15, 16];

  if (isLive) {
    if (!isMarketHours()) return [];

    const currentHour = getCurrentMarketHour();
    const date = new Date(today);
    date.setHours(currentHour, 0, 0, 0);

    const change = (Math.random() - 0.5) * 0.005 + config.trend;
    data.push(createOHLCV(date, currentPrice, change, config.baseVolume / 8, 'yyyy-MM-dd HH:mm:ss'));
  } else {
    for (const hour of marketHours) {
      const date = new Date(today);
      date.setHours(hour, 0, 0, 0);
      const change = (Math.random() - 0.5) * 0.01 + config.trend;
      data.push(createOHLCV(date, currentPrice, change, config.baseVolume / 8, 'yyyy-MM-dd HH:mm:ss'));
      currentPrice = data[data.length - 1].close;
    }
  }
  return data;
};

/**
 * Generates daily stock data for a specified number of days
 * Skips weekends and applies realistic volatility and trend patterns
 */
const generateStockData = (ticker: string, days: number, isLive = false, lastPrice?: number): OHLCV[] => {
  if (!isSupportedTicker(ticker)) return [];
  const config = STOCK_CONFIGS[ticker];

  const data: OHLCV[] = [];
  let currentPrice = lastPrice || config.startPrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const iterations = isLive ? 1 : days;

  for (let i = 0; i < iterations; i++) {
    const date = isLive ? new Date() : new Date(startDate);
    if (!isLive) date.setDate(date.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = isLive ? config.volatility * 0.5 : config.volatility;
    const change = (Math.random() - 0.5) * volatility + config.trend;
    data.push(createOHLCV(date, currentPrice, change, config.baseVolume, isLive ? 'yyyy-MM-dd' : 'yyyy-MM-dd'));
    currentPrice = data[data.length - 1].close;
  }
  return data;
};

/**
 * Generates stock data for a custom date range
 * Useful for user-selected date ranges in the chart interface
 */
export const generateCustomDateRangeData = (ticker: string, startDate: Date, endDate: Date, isLive = false, lastPrice?: number): OHLCV[] => {
  if (!isSupportedTicker(ticker)) return [];
  const config = STOCK_CONFIGS[ticker];

  const data: OHLCV[] = [];
  let currentPrice = lastPrice || config.startPrice;
  const days = differenceInDays(endDate, startDate) + 1;

  const iterations = isLive ? 1 : days;

  for (let i = 0; i < iterations; i++) {
    const date = isLive ? new Date() : addDays(startDate, i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = isLive ? config.volatility * 0.5 : config.volatility;
    const change = (Math.random() - 0.5) * volatility + config.trend;
    data.push(createOHLCV(date, currentPrice, change, config.baseVolume, 'yyyy-MM-dd'));
    currentPrice = data[data.length - 1].close;
  }
  return data;
};

/**
 * Generates complete stock data for all supported tickers and all time periods
 * This is the main data generation function that creates the initial dataset
 */
const generateAllStockData = (): StockData => {
  const stocks: StockData = {};

  for (const ticker of Object.keys(STOCK_CONFIGS)) {
    stocks[ticker] = {
      '1D': generate1DayData(ticker),
      ...Object.fromEntries(Object.entries(DAYS_MAP).map(([period, days]) => [period, generateStockData(ticker, days)])),
    } as StockData[string];
  }

  return stocks;
};

/**
 * Generates 1-day data up to the current market hour
 * Used for live data updates during market hours
 */
export const generate1DayDataUpToCurrent = (ticker: string): OHLCV[] => {
  if (!isSupportedTicker(ticker)) return [];
  const config = STOCK_CONFIGS[ticker];

  const data: OHLCV[] = [];
  let currentPrice = config.startPrice;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const marketHours = [9, 10, 11, 12, 13, 14, 15, 16];
  const currentHour = getCurrentMarketHour();

  if (!isMarketHours()) return generate1DayData(ticker);

  for (const hour of marketHours) {
    if (hour > currentHour) break;
    const date = new Date(today);
    date.setHours(hour, 0, 0, 0);
    const change = (Math.random() - 0.5) * 0.01 + config.trend;
    data.push(createOHLCV(date, currentPrice, change, config.baseVolume / 8, 'yyyy-MM-dd HH:mm:ss'));
    currentPrice = data[data.length - 1].close;
  }
  return data;
};

/**
 * Generates 1-day data for a specific target date
 * Handles both historical dates and current day with market hour awareness
 */
export const generate1DayDataForDate = (ticker: string, targetDate: Date): OHLCV[] => {
  if (!isSupportedTicker(ticker)) return [];
  const config = STOCK_CONFIGS[ticker];

  const data: OHLCV[] = [];
  let currentPrice = config.startPrice;
  
  const date = new Date(targetDate);
  date.setHours(0, 0, 0, 0);

  const marketHours = [9, 10, 11, 12, 13, 14, 15, 16];
  
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const currentHour = isToday ? getCurrentMarketHour() : 16;

  for (const hour of marketHours) {
    if (isToday && hour > currentHour) break;
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);
    const change = (Math.random() - 0.5) * 0.01 + config.trend;
    data.push(createOHLCV(hourDate, currentPrice, change, config.baseVolume / 8, 'yyyy-MM-dd HH:mm:ss'));
    currentPrice = data[data.length - 1].close;
  }
  return data;
};

/**
 * Ensures the last data point has today's date
 * Used to keep historical data current when displaying charts
 */
export const ensureLastPointIsToday = (data: OHLCV[], period: ChartPeriod): OHLCV[] => {
  if (data.length === 0) return data;
  
  const today = new Date();
  const lastPoint = data[data.length - 1];
  const lastDate = new Date(lastPoint.date);
  
  if (lastDate.toDateString() !== today.toDateString()) {
    const updatedData = [...data];
    const updatedLastPoint = {
      ...lastPoint,
      date: period === '1D' 
        ? format(today, 'yyyy-MM-dd HH:mm:ss')
        : format(today, 'yyyy-MM-dd')
    };
    updatedData[updatedData.length - 1] = updatedLastPoint;
    return updatedData;
  }
  
  return data;
};

export const MOCK_STOCK_DATA = generateAllStockData();

/**
 * Retrieves stock data for a specific ticker and time period
 */
export const getStockData = (ticker: string, period: ChartPeriod): OHLCV[] => {
  return MOCK_STOCK_DATA[ticker]?.[period] || [];
};

/**
 * Returns filtered data for large datasets (like 2Y period)
 * Reduces data points to improve chart performance
 */
export const getFilteredData = (ticker: string, period: ChartPeriod): OHLCV[] => {
  const data = getStockData(ticker, period);
  return period === '2Y' && data.length > 500 ? data.filter((_, i) => i % 2 === 0) : data;
};

/**
 * Generates a single live data point for real-time updates
 * Used for live chart updates during market hours
 */
export const generateLiveDataPoint = (ticker: string, period: ChartPeriod, lastPrice?: number): OHLCV[] => {
  return period === '1D'
    ? generate1DayData(ticker, true, lastPrice)
    : generateStockData(ticker, DAYS_MAP[period], true, lastPrice);
};

/**
 * Updates an existing data point with live market data
 * Modifies OHLCV values based on current market conditions and volatility
 */
export const updateLiveDataPoint = (currentPoint: OHLCV, ticker: string, period: ChartPeriod): OHLCV => {
  if (!isSupportedTicker(ticker)) return currentPoint;
  const config = STOCK_CONFIGS[ticker];

  if (period === '1D') {
    if (!isMarketHours()) return currentPoint;
  } else {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    if (day === 0 || day === 6 || hour < 9 || hour > 16) {
      return currentPoint;
    }
  }

  const volatility = 0.005;
  const change = (Math.random() - 0.5) * volatility + config.trend;
  const newClose = currentPoint.close * (1 + change);
  const newHigh = Math.max(currentPoint.high, newClose);
  const newLow = Math.min(currentPoint.low, newClose);
  const volumeChange = (Math.random() - 0.5) * 0.1;
  const newVolume = Math.floor(currentPoint.volume * (1 + volumeChange));

  return {
    ...currentPoint,
    close: Number(newClose.toFixed(2)),
    high: Number(newHigh.toFixed(2)),
    low: Number(newLow.toFixed(2)),
    volume: newVolume,
  };
};

/**
 * Generates live data point for custom date ranges
 * Used for real-time updates on user-selected date ranges
 */
export const generateLiveCustomDataPoint = (ticker: string, startDate: Date, endDate: Date, lastPrice?: number): OHLCV[] => {
  return generateCustomDateRangeData(ticker, startDate, endDate, true, lastPrice);
};
