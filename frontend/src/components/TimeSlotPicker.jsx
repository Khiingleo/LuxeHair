import React from 'react';
import { formatTime } from '../utils/timeSlots';

const TimeSlotPicker = ({ timeSlots, selectedTime, onTimeSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((slot) => (
          <div key={slot.time} className="relative group">
            <button
              onClick={() => slot.available && onTimeSelect(slot.time)}
              disabled={!slot.available}
              className={`w-full p-3 rounded-md text-sm font-medium transition-colors ${
                !slot.available
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : selectedTime === slot.time
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-amber-100 hover:text-amber-800'
              }`}
            >
              {formatTime(slot.time)}
            </button>
            {!slot.available && slot.reason && (
              <div className="absolute top-full mt-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition">
                {slot.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
