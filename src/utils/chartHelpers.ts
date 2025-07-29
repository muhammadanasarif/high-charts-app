import type { OHLCV, SMAConfig } from '../types/stock.types';
import type { ChartOptions } from '../types/chart.types';
import { formatVolume } from './calculations';

const transformToCandlestickData = (data: OHLCV[]): [string, number, number, number, number][] => {
  return data.map(point => [
    point.date,
    point.open,
    point.high,
    point.low,
    point.close,
  ]);
};

const transformToVolumeData = (data: OHLCV[]): [string, number, number][] => {
  return data.map(point => [
    point.date,
    point.volume,
    point.close > point.open ? 1 : -1,
  ]);
};

const transformToSMAData = (data: OHLCV[], smaValues: (number | null)[]): [string, number | null][] => {
  return data.map((point, index) => [
    point.date,
    smaValues[index] || null,
  ]);
};

/**
 * Creates Highcharts configuration options for stock charts
 * Includes candlestick data, volume, SMA indicators, and cross-tab hover synchronization
 */
export const createChartOptions = (
  stockData: OHLCV[],
  smaConfigs: SMAConfig[],
  smaValues: Record<number, (number | null)[]>,
  selectedStock: string,
  sendMessage?: (data: any) => void
): ChartOptions => {
  const candlestickData = transformToCandlestickData(stockData);
  const volumeData = transformToVolumeData(stockData);
  
  const smaSeries = smaConfigs
    .filter(config => config.enabled)
    .map(config => ({
      name: config.label,
      type: 'line' as const,
      data: transformToSMAData(stockData, smaValues[config.period] || []),
      color: config.color,
      lineWidth: 2,
      marker: {
        enabled: false,
      },
      tooltip: {
        valueDecimals: 2,
      },
      connectNulls: false, 
    }));

  const is1DData = stockData.length > 0 && stockData[0].date.includes(':');

  return {
    chart: {
      type: 'candlestick',
      backgroundColor: '#ffffff',
      style: {
        fontFamily: 'Arial, sans-serif',
      },
      height: 600,
      spacing: [10, 10, 10, 10],

    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'category',
      categories: stockData.map(point => point.date),
      labels: {
        style: {
          fontSize: '11px',
          color: '#666666',
        },
        formatter: function() {
          const date = new Date(this.value);
          
          if (is1DData) {
            return new Intl.DateTimeFormat('en', { 
              hour: 'numeric',
              hour12: true 
            }).format(date);
          } else {
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const year = date.getFullYear();
            const currentYear = new Date().getFullYear();
            
            if (year !== currentYear || date.getMonth() === 0) {
              return `${month} ${year}`;
            }
            return month;
          }
        },
        step: Math.max(1, Math.floor(stockData.length / 8)),
      },
      lineColor: '#e6e6e6',
      tickColor: '#e6e6e6',
    },
    yAxis: [
      {
        title: {
          text: 'Price ($)',
          style: {
            fontSize: '12px',
            color: '#666666',
          },
        },
        labels: {
          style: {
            fontSize: '11px',
            color: '#666666',
          },
          formatter: function() {
            return Number(this.value).toFixed(2);
          },
        },
        gridLineColor: '#f0f0f0',
        opposite: false,
        height: '60%',
        top: '10%',
      },
      {
        title: {
          text: 'Volume',
          style: {
            fontSize: '12px',
            color: '#666666',
          },
        },
        labels: {
          style: {
            fontSize: '11px',
            color: '#666666',
          },
          formatter: function() {
            return formatVolume(Number(this.value));
          },
        },
        gridLineColor: '#f0f0f0',
        opposite: true,
        height: '20%',
        top: '75%',
      },
    ],
    series: [
      {
        name: selectedStock,
        type: 'candlestick',
        data: candlestickData,
        color: '#ef5350',
        upColor: '#26a69a',
        lineColor: '#ef5350',
        upLineColor: '#26a69a',
        yAxis: 0,
        tooltip: {
          valueDecimals: 2,
        },
      },
      {
        name: 'Volume',
        type: 'column',
        data: volumeData,
        yAxis: 1,
        color: '#ef5350',
        negativeColor: '#26a69a',
        opacity: 0.7,
        tooltip: {
          valueDecimals: 0,
        },
      },
      ...smaSeries,
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 4,
      shadow: true,
              formatter: function() {
          const points = this.points || [];
          let html = `<div style="font-family: Arial, sans-serif; font-size: 12px;">`;
          
          /**
           * Broadcasts hover data to other tabs/windows for synchronized tooltip display
           * Sends OHLCV data when user hovers over chart points
           */
          if (sendMessage) {
            const candlestickPoint = points.find(point => point.series.type === 'candlestick');
            const volumePoint = points.find(point => point.series.type === 'column');
            
            if (candlestickPoint) {
              const date = candlestickPoint.category || candlestickPoint.x || '';
              const pointData = candlestickPoint as any;
              const open = pointData.open || 0;
              const high = pointData.high || 0;
              const low = pointData.low || 0;
              const close = pointData.close || 0;
              
              sendMessage({
                type: 'hover',
                date: String(date),
                open: Number(open),
                high: Number(high),
                low: Number(low),
                close: Number(close),
                volume: volumePoint ? (Number(volumePoint.y) || 0) : 0,
              });
            }
          }
        
        points.forEach(point => {
          if (point.series.type === 'candlestick') {
            const date = point.category || point.x || '';
            const pointData = point as any;
            const open = pointData.open || 0;
            const high = pointData.high || 0;
            const low = pointData.low || 0;
            const close = pointData.close || 0;
            
            const timeFormat = is1DData 
              ? new Intl.DateTimeFormat('en', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric',
                  hour12: true 
                }).format(new Date(date))
              : date;
            
            html += `
              <div style="margin-bottom: 8px;">
                <strong>${point.series.name}</strong><br/>
                <strong>${timeFormat}</strong><br/>
                Open: $${open}<br/>
                High: $${high}<br/>
                Low: $${low}<br/>
                Close: $${close}
              </div>
            `;
          } else if (point.series.type === 'column') {
            html += `
              <div style="margin-bottom: 8px;">
                <strong>Volume</strong><br/>
                ${formatVolume(point.y || 0)}
              </div>
            `;
          } else if (point.series.type === 'line') {
            html += `
              <div style="margin-bottom: 4px;">
                <strong>${point.series.name}</strong>: $${point.y}
              </div>
            `;
          }
        });
        
        html += `</div>`;
        return html;
      },
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      itemStyle: {
        fontSize: '11px',
        color: '#666666',
      },
      symbolWidth: 10,
      symbolHeight: 10,
    },
    plotOptions: {
      candlestick: {
        color: '#ef5350',
        upColor: '#26a69a',
        lineColor: '#ef5350',
        upLineColor: '#26a69a',
        events: {
          /**
           * Broadcasts mouseout event to clear tooltips in other tabs/windows
           */
          mouseOut: function() {
            if (sendMessage) {
              sendMessage({ type: 'mouseout' });
            }
          }
        }
      },
      line: {
        marker: {
          enabled: false,
        },
      },
      column: {
        borderWidth: 0,
      },
    },
    credits: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768,
          },
          chartOptions: {
            legend: {
              enabled: false,
            },
          },
        },
      ],
    },
  };
}; 