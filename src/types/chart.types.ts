import type { Options } from 'highcharts';

export interface ChartConfig {
  stockData: any[];
  smaSeries: any[];
  volumeSeries: any[];
  selectedPeriod: string;
  selectedStock: string;
}

export interface ChartOptions extends Options {

} 