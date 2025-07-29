import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { OHLCV, SMAConfig } from '../../types/stock.types';
import { createChartOptions } from '../../utils/chartHelpers';
import { useBroadcastChannel } from '../../hooks/useBroadcastChannel';

// Import Highcharts modules
import 'highcharts/highcharts-more';
import 'highcharts/modules/stock';

interface StockChartProps {
  stockData: OHLCV[];
  smaConfigs: SMAConfig[];
  smaValues: Record<number, (number | null)[]>;
  selectedStock: string;
}

const StockChart: React.FC<StockChartProps> = React.memo(({
  stockData,
  smaConfigs,
  smaValues,
  selectedStock,
}) => {
  /**
   * Broadcasts chart hover events to other tabs/windows for synchronized tooltip display
   */
  const { sendMessage } = useBroadcastChannel('stock-hover');

  const chartOptions = useMemo(() => {
    return createChartOptions(stockData, smaConfigs, smaValues, selectedStock, sendMessage);
  }, [stockData, smaConfigs, smaValues, selectedStock, sendMessage]);

  if (stockData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 text-lg">No data available</div>
          <div className="text-gray-400 text-sm">Please select a stock to view the chart</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="relative">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
    </div>
  );
});

StockChart.displayName = 'StockChart';

export default StockChart; 