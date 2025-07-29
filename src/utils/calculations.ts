import type { OHLCV } from '../types/stock.types';

export const calculateSMA = (data: OHLCV[], period: number): (number | null)[] => {
  if (data.length === 0) return [];
  
  const smaValues: (number | null)[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, point) => acc + point.close, 0);
    
    smaValues.push(Number((sum / period).toFixed(2)));
  }
  
  if (smaValues.length > 0) {
    const firstSMAValue = smaValues[0];
    const fullSMAValues: (number | null)[] = [];
    
    for (let i = 0; i < period - 1; i++) {
      fullSMAValues.push(firstSMAValue);
    }
    
    fullSMAValues.push(...smaValues);
    
    return fullSMAValues;
  }
  
  return smaValues;
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Number(((current - previous) / previous * 100).toFixed(2));
};

export const calculatePriceChange = (current: number, previous: number): number => {
  return Number((current - previous).toFixed(2));
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  }
  return volume.toString();
};

export const getCurrentStockInfo = (data: OHLCV[]) => {
  if (data.length === 0) return null;
  
  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  
  return {
    currentPrice: latest.close,
    open: latest.open,
    high: latest.high,
    low: latest.low,
    volume: latest.volume,
    change: calculatePriceChange(latest.close, previous.close),
    changePercent: calculatePercentageChange(latest.close, previous.close),
  };
}; 