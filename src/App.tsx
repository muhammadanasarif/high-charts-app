import { useState, useCallback, useEffect, useMemo } from 'react';

import { useStockData } from './hooks/useStockData';
import StockChart from './components/Chart/StockChart';
import ChartWrapper from './components/Chart/ChartWrapper';
import { DEFAULT_SMA_CONFIGS } from './constants/chartConfig';
import { useBroadcastChannel } from './hooks/useBroadcastChannel';
import type { SMAConfig, ChartPeriod, PriceUpdate } from './types/stock.types';

interface HoverData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function App() {
  const [smaConfigs, setSmaConfigs] = useState<SMAConfig[]>(DEFAULT_SMA_CONFIGS);
  const [selectedStock, setSelectedStock] = useState('IBM');
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('1Y');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [useCustomRange, setUseCustomRange] = useState(false);

  const {
    stockData,
    smaValues,
    currentPriceInfo: hookPriceInfo,
    isLoading,
    error,
  } = useStockData(selectedStock, selectedPeriod, smaConfigs, useCustomRange, dateRange);

  /**
   * Sets up cross-tab communication for synchronized chart hover events
   * Listens for hover data from other chart instances in different tabs/windows
   */
  const { listen } = useBroadcastChannel('stock-hover');

  useEffect(() => {
    const cleanup = listen((data) => {
      if (data.type === 'hover') {
        setHoverData(data);
      } else if (data.type === 'mouseout') {
        setHoverData(null);
      }
    });
    return cleanup;
  }, [listen]);

  const handleStockChange = useCallback((stock: string) => {
    setSelectedStock(stock);
    setHoverData(null);
  }, []);

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period as ChartPeriod);
    setUseCustomRange(false);
    setHoverData(null);
  }, []);

  const handleSMAConfigChange = useCallback((configs: SMAConfig[]) => {
    setSmaConfigs(configs);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    setUseCustomRange(true);
    setHoverData(null);
  }, []);

  const displayPriceInfo = hoverData || hookPriceInfo;

  const memoizedChart = useMemo(() => (
    <StockChart
      stockData={stockData}
      smaConfigs={smaConfigs}
      smaValues={smaValues}
      selectedStock={selectedStock}
    />
  ), [stockData, smaConfigs, smaValues, selectedStock]);

    return (
    <ChartWrapper
      selectedStock={selectedStock}
      onStockChange={handleStockChange}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
      smaConfigs={smaConfigs}
      onSMAConfigChange={handleSMAConfigChange}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      displayPriceInfo={displayPriceInfo as PriceUpdate}
      useCustomRange={useCustomRange}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-800">Loading stock data...</div>
        </div>
      )}

      {memoizedChart}
    </ChartWrapper>
  );
}

export default App;
