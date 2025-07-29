export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SMAConfig {
  period: number;
  label: string;
  color: string;
  enabled: boolean;
}

export interface PriceUpdate {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  smaValues: Record<number, number | null>;
}

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y';

export interface StockInfo {
  ticker: string;
  name: string;
}

// Updated to support multiple periods per stock
export interface StockData {
  [ticker: string]: {
    [period in ChartPeriod]: OHLCV[];
  };
} 