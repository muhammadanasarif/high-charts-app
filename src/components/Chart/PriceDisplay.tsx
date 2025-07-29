import React from 'react';
import type { PriceUpdate } from '../../types/stock.types';
import { formatVolume } from '../../utils/calculations';
import { CHART_COLORS } from '../../constants/colors';

interface PriceDisplayProps {
  priceInfo: PriceUpdate | null;
  selectedStock: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ priceInfo }) => {
  if (!priceInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center text-gray-500">
          Hover over the chart to see price details
        </div>
      </div>
    );
  }

  const { open, high, low, close, volume, smaValues } = priceInfo;
  const change = close - open;
  const changePercent = ((change / open) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-900">
            ${close.toFixed(2)}
          </div>
          <div 
            className={`text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">OHLC</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">O:</span>
              <span className="ml-1 font-medium">${open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">H:</span>
              <span className="ml-1 font-medium">${high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">L:</span>
              <span className="ml-1 font-medium">${low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">C:</span>
              <span className="ml-1 font-medium">${close.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1">Volume</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatVolume(volume)}
          </div>
        </div>
      </div>

      {Object.keys(smaValues).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Moving Averages</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(smaValues).map(([period, value]) => (
              <div key={period} className="flex items-center space-x-2">
                <div
                  className="w-3 h-0.5 rounded"
                  style={{ 
                    backgroundColor: CHART_COLORS[`SMA_${period}` as keyof typeof CHART_COLORS] || '#666'
                  }}
                />
                <span className="text-sm text-gray-600">SMA({period}):</span>
                <span className="text-sm font-medium">
                  {value ? `$${value.toFixed(2)}` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay; 