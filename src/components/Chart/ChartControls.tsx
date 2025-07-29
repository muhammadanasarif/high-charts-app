import React, { useState, useRef, useEffect } from 'react';
import type { SMAConfig } from '../../types/stock.types';

interface ChartControlsProps {
  smaConfigs: SMAConfig[];
  onSMAConfigChange: (configs: SMAConfig[]) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  smaConfigs,
  onSMAConfigChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSMA = (period: number) => {
    const updatedConfigs = smaConfigs.map(config =>
      config.period === period
        ? { ...config, enabled: !config.enabled }
        : config
    );
    onSMAConfigChange(updatedConfigs);
  };

  const enabledCount = smaConfigs.filter(config => config.enabled).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1 transition-colors"
      >
        <span>SMA</span>
        {enabledCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {enabledCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-48 z-50">
          <div className="text-sm font-semibold text-gray-700 mb-3">Moving Averages</div>
          
          <div className="space-y-2">
            {smaConfigs.map((config) => (
              <label
                key={config.period}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => toggleSMA(config.period)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-sm text-gray-700">{config.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartControls; 