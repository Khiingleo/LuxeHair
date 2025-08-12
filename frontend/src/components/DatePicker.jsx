import React from 'react';
import { format, addDays, startOfWeek, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ selectedDate, onDateSelect }) => {
  const [currentWeek, setCurrentWeek] = React.useState(startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const isToday = (date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  const isSelected = (date) => {
    return selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  const isPast = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {format(currentWeek, 'MMM yyyy')}
          </span>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => !isPast(date) && onDateSelect(date)}
            disabled={isPast(date)}
            className={`p-3 rounded-md text-center transition-colors ${
              isPast(date)
                ? 'text-gray-300 cursor-not-allowed'
                : isSelected(date)
                ? 'bg-amber-600 text-white'
                : isToday(date)
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="text-xs font-medium">
              {format(date, 'EEE')}
            </div>
            <div className="text-sm font-semibold">
              {format(date, 'd')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;