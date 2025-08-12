import { format, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

// export const generateTimeSlots = (date, bookedTimes = []) => {
//   const slots = [];
//   const start = new Date(date);
//   start.setHours(9, 0, 0, 0); // 9 AM
//   const end = new Date(date);
//   end.setHours(17, 0, 0, 0); // 5 PM

//   let current = start;
//   while (isBefore(current, end)) {
//     const timeString = format(current, 'HH:mm');
//     const isBooked = bookedTimes.includes(timeString);
//     const isPast = isAfter(new Date(), current);
    
//     slots.push({
//       time: timeString,
//       available: !isBooked && !isPast
//     });

//     current = addMinutes(current, 30); // 30-minute intervals
//   }

//   return slots;
// };

// export const formatTime = (time) => {
//   const [hours, minutes] = time.split(':');
//   const hour = parseInt(hours);
//   const ampm = hour >= 12 ? 'PM' : 'AM';
//   const displayHour = hour % 12 || 12;
//   return `${displayHour}:${minutes} ${ampm}`;
// };


/**
 * @param {Date} date - The date to generate time slots for.
 * @param {Array<string>} bookedTimes - e.g., ['09:30', '14:00']
 * @returns {Array<{ time: string, available: boolean, reason?: string }>}
 */
export const generateTimeSlots = (date, bookedTimes = []) => {
  const slots = [];
  const start = new Date(date);
  start.setHours(9, 0, 0, 0); // 9 AM

  const end = new Date(date);
  end.setHours(17, 0, 0, 0); // 5 PM

  let current = start;
  const now = new Date();

  while (isBefore(current, end)) {
    const timeString = format(current, 'HH:mm');
    let available = true;
    let reason = '';

    if (bookedTimes.includes(timeString)) {
      available = false;
      reason = 'Already booked';
    } else if (isAfter(now, current)) {
      available = false;
      reason = 'In the past';
    }

    slots.push({
      time: timeString,
      available,
      reason: available ? null : reason,
    });

    current = addMinutes(current, 30);
  }

  return slots;
};

export const formatTime = (time) => {
  if (typeof time !== 'string' || !time.includes(':')) return time;

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
