/**
 * Converts a time string (HH:mm) to 12-hour format with AM/PM
 * @param {string} timeString - The time string to format (e.g., "13:30")
 * @returns {string} - The formatted time string (e.g., "1:30 PM")
 */
export const formatTime = (timeString) => {
  if (!timeString || timeString === "--:--" || typeof timeString !== 'string') return timeString;
  
  // Check if it already has AM/PM to avoid double formatting
  if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
    return timeString;
  }

  const parts = timeString.split(':');
  if (parts.length < 2) return timeString;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  
  if (isNaN(hours)) return timeString;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
};
