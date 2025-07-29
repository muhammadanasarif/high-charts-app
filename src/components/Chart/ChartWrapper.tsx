import React from 'react';

import ChartControls from './ChartControls';
import DateRangePicker from '../UI/DateRangePicker';
import { CHART_PERIODS } from '../../constants/periods';
import type { SMAConfig, ChartPeriod, PriceUpdate } from '../../types/stock.types';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ChartWrapperProps {
  selectedStock: string;
  onStockChange: (stock: string) => void;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: string) => void;
  smaConfigs: SMAConfig[];
  onSMAConfigChange: (configs: SMAConfig[]) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  displayPriceInfo: PriceUpdate | null;
  useCustomRange: boolean;
  children: React.ReactNode;
}

const OHLCV_OPTIONS = ["IBM", "AAPL"];

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  selectedStock,
  onStockChange,
  selectedPeriod,
  onPeriodChange,
  smaConfigs,
  onSMAConfigChange,
  dateRange,
  onDateRangeChange,
  displayPriceInfo,
  useCustomRange,
  children
}) => {
    const netProfit = displayPriceInfo && ((displayPriceInfo.close - displayPriceInfo.open) / displayPriceInfo.open * 100) || 0
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold text-gray-700">Stock:</label>
              <select 
                value={selectedStock}
                onChange={(e) => onStockChange(e.target.value)}
                className="px-4 py-2 text-lg bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {OHLCV_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 px-3 py-1 rounded text-blue-800 font-semibold">
                {selectedStock}
              </div>
              {displayPriceInfo && (
                <div className="text-lg font-semibold">
                  {displayPriceInfo.close.toFixed(2)}
                </div>
              )}
            </div>
            {displayPriceInfo && (
              <div className="text-sm text-gray-600">
                O {displayPriceInfo.open.toFixed(2)} H {displayPriceInfo.high.toFixed(2)} L {displayPriceInfo.low.toFixed(2)} C {displayPriceInfo.close.toFixed(2)} 
                <span className={`ml-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}%)
                </span>
                <span className="ml-2">Vol {displayPriceInfo.volume >= 1000000 ? `${(displayPriceInfo.volume / 1000000).toFixed(1)}M` : `${(displayPriceInfo.volume / 1000).toFixed(0)}K`}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          {children}
        </div>

        <div className="flex items-center justify-start gap-4 flex-wrap">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex space-x-1">
              {CHART_PERIODS.map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    selectedPeriod === period && !useCustomRange
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => onPeriodChange(period)}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              minDate={new Date(2022, 0, 1)}
              maxDate={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                return tomorrow;
              })()}
            />
          </div>
          
          <ChartControls
            smaConfigs={smaConfigs}
            onSMAConfigChange={onSMAConfigChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartWrapper; 