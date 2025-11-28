/**
 * Format date to dd/mm/yyyy
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDateDDMMYYYY(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Parse dd/mm/yyyy format to Date
 * @param {string} dateString - Date string in dd/mm/yyyy format
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDateDDMMYYYY(dateString) {
  if (!dateString || dateString === '') return null;
  
  // Try dd/mm/yyyy format first
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.toString().trim().match(ddmmyyyy);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Fallback to standard Date parsing
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Convert date to YYYY-MM-DD format for input[type="date"]
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function dateToInputFormat(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
}

/**
 * Compare two dates (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Check if two dates are the same (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are the same
 */
export function isSameDate(date1, date2) {
  if (!date1 || !date2) return false;
  return compareDates(date1, date2) === 0;
}

/**
 * Format date to yyyy-MM-dd (for internal use, grouping, etc.)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in yyyy-MM-dd format
 */
export function formatDateYYYYMMDD(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

