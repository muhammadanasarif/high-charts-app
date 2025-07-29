import { useState, useMemo, useEffect, useRef } from 'react';

import {
  getStockData,
  generate1DayDataUpToCurrent,
  generate1DayDataForDate,
  updateLiveDataPoint,
  ensureLastPointIsToday,
  generateCustomDateRangeData,
  isMarketHours,
} from '../data/mockData';
import { calculateSMA } from '../utils/calculations';
import type { SMAConfig, PriceUpdate, ChartPeriod, OHLCV } from '../types/stock.types';

/**
 * Custom hook for managing stock data with live updates and technical indicators
 * Handles data fetching, live updates during market hours, and SMA calculations
 */
export const useStockData = (
  selectedStock: string,
  selectedPeriod: ChartPeriod,
  smaConfigs: SMAConfig[],
  useCustomRange: boolean = false,
  dateRange?: { startDate: Date; endDate: Date }
) => {
  const [stockData, setStockData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  /**
   * Loads initial stock data based on selected period or custom date range
   * Handles different data generation strategies for various time periods
   */
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      let data: OHLCV[];

      if (useCustomRange && dateRange) {
        const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          data = generate1DayDataForDate(selectedStock, dateRange.startDate);
        } else {
          data = generateCustomDateRangeData(selectedStock, dateRange.startDate, dateRange.endDate);
        }
      } else {
        data =
          selectedPeriod === '1D'
            ? generate1DayDataUpToCurrent(selectedStock)
            : getStockData(selectedStock, selectedPeriod);
      }

      data = ensureLastPointIsToday(data, selectedPeriod);

      setStockData(data);
      lastPriceRef.current = data.at(-1)?.close ?? null;
    } catch (err) {
      setError('Failed to load stock data');
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStock, selectedPeriod, useCustomRange, dateRange]);

  /**
   * Sets up live data updates during market hours
   * Updates the latest data point every 5 seconds with realistic price movements
   */
  useEffect(() => {
    const updateData = () => {
      try {
        /**
         * Determines if live updates should be applied based on market hours
         * For custom ranges, only updates if the end date is today
         */
        const shouldUpdate = () => {
          if (useCustomRange && dateRange) {
            const today = new Date();
            const endDate = new Date(dateRange.endDate);
            const isToday = endDate.toDateString() === today.toDateString();
            return isToday && isMarketHours();
          }
          
          return isMarketHours();
        };

        if (!shouldUpdate()) return;

        setStockData(prevData => {
          if (prevData.length === 0) return prevData;

          const updatedData = [...prevData];
          const currentPoint = updatedData[updatedData.length - 1];
          const updatedPoint = updateLiveDataPoint(currentPoint, selectedStock, selectedPeriod);
          updatedData[updatedData.length - 1] = updatedPoint;

          lastPriceRef.current = updatedPoint.close;
          return updatedData;
        });
      } catch (err) {
        console.error('Error generating live data:', err);
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(updateData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedStock, selectedPeriod, useCustomRange, dateRange]);

  /**
   * Calculates Simple Moving Average (SMA) values for enabled configurations
   * Returns an object mapping SMA periods to their calculated values
   */
  const smaValues = useMemo(() => {
    const values: Record<number, (number | null)[]> = {};

    smaConfigs
      .filter(config => config.enabled)
      .forEach(config => {
        values[config.period] = calculateSMA(stockData, config.period);
      });

    return values;
  }, [stockData, smaConfigs]);

  /**
   * Computes current price information including OHLCV and SMA values
   * Provides the latest market data for display components
   */
  const currentPriceInfo = useMemo((): PriceUpdate | null => {
    if (stockData.length === 0) return null;

    const latest = stockData.at(-1)!;
    const smaValuesForLatest: Record<number, number | null> = {};

    smaConfigs
      .filter(config => config.enabled)
      .forEach(config => {
        const smaData = smaValues[config.period];
        smaValuesForLatest[config.period] = smaData?.at(-1) ?? null;
      });

    return {
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
      volume: latest.volume,
      smaValues: smaValuesForLatest,
    };
  }, [stockData, smaConfigs, smaValues]);

  return {
    stockData,
    smaValues,
    currentPriceInfo,
    isLoading,
    error,
  };
};
