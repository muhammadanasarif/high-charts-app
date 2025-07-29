import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isWithinInterval, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  dateRange, 
  onDateRangeChange, 
  minDate = new Date(2022, 0, 1), 
  maxDate 
}) => {
  const [currentMonth, setCurrentMonth] = useState(dateRange.startDate);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const effectiveMaxDate = maxDate || (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  })();

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (day: Date) => {
    if (isBefore(day, minDate) || isAfter(day, effectiveMaxDate)) {
      return;
    }

    if (!isSelectingEnd) {
      onDateRangeChange({ startDate: day, endDate: day });
      setIsSelectingEnd(true);
    } else {
      if (day < dateRange.startDate) {
        onDateRangeChange({ startDate: day, endDate: dateRange.startDate });
      } else {
        onDateRangeChange({ startDate: dateRange.startDate, endDate: day });
      }
      setIsSelectingEnd(false);
    }
  };

  const isInRange = (day: Date) => {
    return isWithinInterval(day, {
      start: startOfDay(dateRange.startDate),
      end: endOfDay(dateRange.endDate),
    });
  };

  const isRangeStart = (day: Date) => isSameDay(day, dateRange.startDate);
  const isRangeEnd = (day: Date) => isSameDay(day, dateRange.endDate);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center space-x-2 px-3 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Calendar className="w-4 h-4" />
          <span>
            {format(dateRange.startDate, 'MMM dd')} - {format(dateRange.endDate, 'MMM dd, yyyy')}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-600 mb-2">
            {isSelectingEnd ? 'Select end date' : 'Select start date'}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const inRange = isInRange(day);
              const isStart = isRangeStart(day);
              const isEnd = isRangeEnd(day);
              const isDisabled = isBefore(day, minDate) || isAfter(day, effectiveMaxDate);
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`
                    p-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 relative
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-100'}
                    ${isStart ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isEnd ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${inRange && !isStart && !isEnd ? 'bg-blue-100 text-blue-600' : ''}
                    ${isCurrentDay && !inRange && !isDisabled ? 'bg-blue-50 text-blue-600' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Start: {format(dateRange.startDate, 'MMM dd, yyyy')}</span>
              <span>End: {format(dateRange.endDate, 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default DateRangePicker; 