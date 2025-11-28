/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export function exportToCSV(data, filename = 'report.csv') {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
  
  // Create CSV header row
  const csvHeaders = headers.map(header => {
    // Escape commas and quotes in headers
    const escaped = header.replace(/"/g, '""');
    return `"${escaped}"`;
  }).join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (value instanceof Date) {
        // Format date as YYYY-MM-DD HH:MM:SS
        value = value.toISOString().replace('T', ' ').substring(0, 19);
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      
      // Escape commas, quotes, and newlines
      const escaped = value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
      return `"${escaped}"`;
    }).join(',');
  });

  // Combine headers and rows
  const csvContent = [csvHeaders, ...csvRows].join('\n');

  // Add BOM for UTF-8 to support special characters in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Generate filename based on date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Filename
 */
export function generateFilename(startDate, endDate) {
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    if (start === end) {
      return `lead_report_${start}.csv`;
    }
    return `lead_report_${start}_to_${end}.csv`;
  } else if (start) {
    return `lead_report_from_${start}.csv`;
  } else if (end) {
    return `lead_report_until_${end}.csv`;
  }
  
  return `lead_report_${new Date().toISOString().split('T')[0]}.csv`;
}

