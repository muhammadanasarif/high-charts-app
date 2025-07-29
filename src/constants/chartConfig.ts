import type { SMAConfig } from '../types/stock.types';
import { SMA_COLORS } from './colors';

export const DEFAULT_SMA_CONFIGS: SMAConfig[] = [
  {
    period: 20,
    enabled: false,
    color: SMA_COLORS[20],
    label: 'SMA(20)',
  },
  {
    period: 50,
    enabled: true,
    color: SMA_COLORS[50],
    label: 'SMA(50)',
  },
  {
    period: 150,
    enabled: true,
    color: SMA_COLORS[150],
    label: 'SMA(150)',
  },
  {
    period: 200,
    enabled: false,
    color: SMA_COLORS[200],
    label: 'SMA(200)',
  },
];

export const AVAILABLE_STOCKS = [
  { ticker: 'IBM', name: 'International Business Machines Corp.' },
  { ticker: 'AAPL', name: 'Apple Inc.' },
];

export const CHART_DEFAULTS = {
  height: 600,
  marginTop: 50,
  marginRight: 50,
  marginBottom: 100,
  marginLeft: 50,
  spacingTop: 20,
  spacingRight: 20,
  spacingBottom: 20,
  spacingLeft: 20,
}; 