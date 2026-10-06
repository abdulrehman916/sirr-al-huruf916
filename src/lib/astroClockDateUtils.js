/**
 * ASTRO CLOCK DATE UTILITIES
 * Safe date formatting with validation for all Astro Clock components
 * Prevents toLocaleTimeString() errors on invalid dates
 */

/**
 * Safely format a date to time string
 * @param {Date|number|string|null|undefined} date - Date value to format
 * @returns {string} Formatted time or fallback
 */
export function safeFormatTime(date) {
  if (!date) return "--:--";
  
  // Handle Date objects
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Handle decimal hour numbers (e.g., 6.5 for sunrise)
  if (typeof date === 'number') {
    const hours = Math.floor(date);
    const minutes = Math.round((date - hours) * 60);
    const h = hours >= 24 ? hours - 24 : hours < 0 ? hours + 24 : hours;
    const hDisplay = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = hours >= 0 && hours < 12 ? 'AM' : 'PM';
    return `${hDisplay}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  
  // Handle strings or other formats
  const safeDate = new Date(date);
  if (isNaN(safeDate.getTime())) return "--:--";
  return safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Safely format a date to date string
 * @param {Date|number|string|null|undefined} date - Date value to format
 * @returns {string} Formatted date or fallback
 */
export function safeFormatDate(date) {
  if (!date) return "--/--";
  
  const safeDate = date instanceof Date ? date : new Date(date);
  if (isNaN(safeDate.getTime())) return "--/--";
  
  return safeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Safely format a date to full datetime string
 * @param {Date|number|string|null|undefined} date - Date value to format
 * @returns {string} Formatted datetime or fallback
 */
export function safeFormatDateTime(date) {
  if (!date) return "--/-- --:--";
  
  const safeDate = date instanceof Date ? date : new Date(date);
  if (isNaN(safeDate.getTime())) return "--/-- --:--";
  
  return safeDate.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate if a value is a valid date
 * @param {*} date - Value to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(date) {
  if (!date) return false;
  const safeDate = date instanceof Date ? date : new Date(date);
  return !isNaN(safeDate.getTime());
}

/**
 * Format countdown milliseconds to HH:MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted countdown
 */
export function formatCountdown(ms) {
  if (!ms || ms < 0) return "00:00:00";
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format countdown milliseconds to MM:SS (for short displays)
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted countdown
 */
export function formatCountdownShort(ms) {
  if (!ms || ms < 0) return "00:00";
  
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}