import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Filters.css';
import { exportToPDF } from '../utils/exportToPDF';
import { formatDateDDMMYYYY, parseDateDDMMYYYY } from '../utils/dateUtils';

function Filters({ data, filters, setFilters, filteredData, chartRefs = {} }) {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [fitScoreRange, setFitScoreRange] = useState({ min: null, max: null });
  const [periodType, setPeriodType] = useState('all'); // 'all', 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState(null); // For calendar picker
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    if (data.length > 0) {
      // Filter data by Date Generated column
      const validDates = data
        .map(row => row['Date Generated'])
        .filter(d => d && d instanceof Date && !isNaN(d.getTime()));
      
      if (validDates.length > 0) {
        const timestamps = validDates.map(d => d.getTime());
        const minDate = new Date(Math.min(...timestamps));
        const maxDate = new Date(Math.max(...timestamps));
        if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
          setDateRange({ start: minDate, end: maxDate });
        }
      }

      const scores = data
        .map(row => row['Fit Score'])
        .filter(s => s !== null && s !== '' && !isNaN(parseFloat(s)))
        .map(s => parseFloat(s));
      
      if (scores.length > 0) {
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        if (!isNaN(minScore) && !isNaN(maxScore)) {
          setFitScoreRange({ min: minScore, max: maxScore });
        }
      }
    }
  }, [data]);

  useEffect(() => {
    // Update filters based on period type
    let newDateRange = null;

    if (periodType === 'daily' && selectedDate) {
      // Parse selected date and set to start and end of day
      const date = selectedDate.includes('/') 
        ? parseDateDDMMYYYY(selectedDate) 
        : new Date(selectedDate);
      
      if (date && !isNaN(date.getTime())) {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        newDateRange = { start: startOfDay, end: endOfDay };
        setFilters({ ...filters, dateRange: newDateRange, periodType: 'daily' });
      }
    } else if (periodType === 'weekly' && dateRange.start && dateRange.end) {
      // Calculate week start (Monday) and end (Sunday)
      const start = new Date(dateRange.start);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const weekStart = new Date(start.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      newDateRange = { start: weekStart, end: weekEnd };
      setFilters({ ...filters, dateRange: newDateRange, periodType: 'weekly' });
    } else if (periodType === 'monthly' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
      newDateRange = { start: monthStart, end: monthEnd };
      setFilters({ ...filters, dateRange: newDateRange, periodType: 'monthly' });
    } else if (periodType === 'all') {
      setFilters({ ...filters, dateRange: null, periodType: 'all' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType, selectedDate, selectedDateObj, selectedMonth, dateRange.start, dateRange.end]);

  const handleDateChange = (type, value) => {
    let dateValue = null;
    if (value) {
      // If value is already a Date object, use it; otherwise parse it
      if (value instanceof Date) {
        dateValue = value;
      } else if (typeof value === 'string') {
        dateValue = parseDateDDMMYYYY(value) || new Date(value);
      } else {
        dateValue = new Date(value);
      }
      
      // Normalize to start/end of day for proper filtering
      if (type === 'start') {
        dateValue = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 0, 0, 0, 0);
      } else if (type === 'end') {
        dateValue = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 23, 59, 59, 999);
      }
    }
    
    const newRange = { ...dateRange, [type]: dateValue };
    setDateRange(newRange);
    if (periodType === 'all') {
      setFilters({ ...filters, dateRange: newRange });
    }
  };

  const handleConnectionStatusChange = (e) => {
    setFilters({ ...filters, connectionStatus: e.target.value });
  };

  const handleFitScoreChange = (type, value) => {
    const newRange = { ...fitScoreRange, [type]: parseFloat(value) || null };
    setFitScoreRange(newRange);
    setFilters({ ...filters, fitScoreRange: newRange });
  };

  const handleDownloadReport = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert('No data to export. Please adjust your filters.');
      return;
    }

    // Show loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#667eea;color:white;padding:20px;border-radius:10px;z-index:10000;';
    loadingMsg.textContent = 'Generating PDF with charts...';
    document.body.appendChild(loadingMsg);

    try {
      // Prepare chart references - wait a bit for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chartRefsForPDF = {};
      
      if (chartRefs.connectionStatus?.current) {
        const connRef = chartRefs.connectionStatus.current;
        if (connRef.pieChart) {
          chartRefsForPDF.connectionStatusPie = { current: connRef.pieChart };
        }
        if (connRef.lineChart) {
          chartRefsForPDF.connectionStatusLine = { current: connRef.lineChart };
        }
      }
      
      if (chartRefs.emailStatus?.current) {
        const emailRef = chartRefs.emailStatus.current;
        if (emailRef.barChart) {
          chartRefsForPDF.emailStatusBar = { current: emailRef.barChart };
        }
        if (emailRef.pieChart) {
          chartRefsForPDF.emailStatusPie = { current: emailRef.pieChart };
        }
      }
      
      if (chartRefs.fitScore?.current) {
        const fitRef = chartRefs.fitScore.current;
        if (fitRef.histogram) {
          chartRefsForPDF.fitScoreHistogram = { current: fitRef.histogram };
        }
      }
      
      if (chartRefs.additionalInsights?.current) {
        const insightsRef = chartRefs.additionalInsights.current;
        if (insightsRef.employers) {
          chartRefsForPDF.topEmployers = { current: insightsRef.employers };
        }
        if (insightsRef.locations) {
          chartRefsForPDF.topLocations = { current: insightsRef.locations };
        }
      }

      await exportToPDF(filteredData, {
        title: 'Lead Management Report',
        dateRange: filters.dateRange,
        periodType: filters.periodType || periodType
      }, chartRefsForPDF);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      document.body.removeChild(loadingMsg);
    }
  };

  const connectionStatuses = ['All', ...new Set(data.map(row => row['Connection Status']).filter(Boolean))];

  // Get available months from data (using Date Generated column)
  const getAvailableMonths = () => {
    const months = new Set();
    data.forEach(row => {
      const date = row['Date Generated'];
      if (date && date instanceof Date && !isNaN(date.getTime())) {
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      }
    });
    return Array.from(months).sort().reverse();
  };

  return (
    <div className="filters-section">
      <h3>🔍 Filters</h3>
      
      <div className="filter-group">
        <label>Period Type</label>
        <select 
          value={periodType} 
          onChange={(e) => {
            setPeriodType(e.target.value);
            setSelectedDate('');
            setSelectedDateObj(null);
            setSelectedMonth('');
          }}
        >
          <option value="all">All Dates</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {periodType === 'daily' && (
        <div className="filter-group">
          <label>Select Date</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <DatePicker
              selected={selectedDateObj}
              onChange={(date) => {
                if (date) {
                  setSelectedDateObj(date);
                  setSelectedDate(formatDateDDMMYYYY(date));
                  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
                  setFilters({ ...filters, dateRange: { start: startOfDay, end: endOfDay }, periodType: 'daily' });
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Click to select date"
              className="date-picker-input"
              showPopperArrow={false}
              isClearable
              onClear={() => {
                setSelectedDateObj(null);
                setSelectedDate('');
                setFilters({ ...filters, dateRange: null, periodType: 'daily' });
              }}
            />
            <span style={{ color: '#666', fontSize: '0.9rem' }}>or</span>
            <input
              type="text"
              placeholder="Type: dd/mm/yyyy"
              value={selectedDate}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDate(value);
                // Auto-parse and update filter when valid date is entered
                if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                  const parsedDate = parseDateDDMMYYYY(value);
                  if (parsedDate && !isNaN(parsedDate.getTime())) {
                    setSelectedDateObj(parsedDate);
                    const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0, 0);
                    const endOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59, 999);
                    setFilters({ ...filters, dateRange: { start: startOfDay, end: endOfDay }, periodType: 'daily' });
                  }
                }
              }}
              onBlur={(e) => {
                // Validate and format on blur
                const value = e.target.value.trim();
                if (value) {
                  const parsedDate = parseDateDDMMYYYY(value);
                  if (parsedDate && !isNaN(parsedDate.getTime())) {
                    setSelectedDate(formatDateDDMMYYYY(parsedDate));
                    setSelectedDateObj(parsedDate);
                    const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0, 0);
                    const endOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59, 999);
                    setFilters({ ...filters, dateRange: { start: startOfDay, end: endOfDay }, periodType: 'daily' });
                  } else {
                    alert('Please enter a valid date in dd/mm/yyyy format (e.g., 25/11/2025)');
                    setSelectedDate('');
                    setSelectedDateObj(null);
                  }
                }
              }}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      )}

      {periodType === 'weekly' && (
        <div className="filter-group">
          <label>Week Range</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) => handleDateChange('start', date)}
                selectsStart
                startDate={dateRange.start}
                endDate={dateRange.end}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start date"
                className="date-picker-input"
                showPopperArrow={false}
                isClearable
              />
              <span style={{ color: '#666', fontSize: '0.9rem' }}>to</span>
              <DatePicker
                selected={dateRange.end}
                onChange={(date) => handleDateChange('end', date)}
                selectsEnd
                startDate={dateRange.start}
                endDate={dateRange.end}
                minDate={dateRange.start}
                dateFormat="dd/MM/yyyy"
                placeholderText="End date"
                className="date-picker-input"
                showPopperArrow={false}
                isClearable
              />
            </div>
          </div>
        </div>
      )}

      {periodType === 'monthly' && (
        <div className="filter-group">
          <label>Select Month</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select a month</option>
            {getAvailableMonths().map(month => {
              const [year, monthNum] = month.split('-');
              const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <option key={month} value={month}>{monthName}</option>
              );
            })}
          </select>
        </div>
      )}

      {periodType === 'all' && (
        <div className="filter-group">
          <label>Date Range (Optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <DatePicker
              selected={dateRange.start}
              onChange={(date) => handleDateChange('start', date)}
              selectsStart
              startDate={dateRange.start}
              endDate={dateRange.end}
              dateFormat="dd/MM/yyyy"
              placeholderText="Start date"
              className="date-picker-input"
              showPopperArrow={false}
              isClearable
            />
            <span style={{ color: '#666', fontSize: '0.9rem' }}>to</span>
            <DatePicker
              selected={dateRange.end}
              onChange={(date) => handleDateChange('end', date)}
              selectsEnd
              startDate={dateRange.start}
              endDate={dateRange.end}
              minDate={dateRange.start}
              dateFormat="dd/MM/yyyy"
              placeholderText="End date"
              className="date-picker-input"
              showPopperArrow={false}
              isClearable
            />
          </div>
        </div>
      )}

      <div className="filter-group">
        <label>Connection Status</label>
        <select value={filters.connectionStatus} onChange={handleConnectionStatusChange}>
          {connectionStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Fit Score Range</label>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={fitScoreRange.min || ''}
            onChange={(e) => handleFitScoreChange('min', e.target.value)}
            step="0.1"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={fitScoreRange.max || ''}
            onChange={(e) => handleFitScoreChange('max', e.target.value)}
            step="0.1"
          />
        </div>
      </div>

      <div className="filter-group download-section">
        <button 
          onClick={handleDownloadReport} 
          className="download-btn"
          disabled={!filteredData || filteredData.length === 0}
          title={filteredData && filteredData.length > 0 ? `Download ${filteredData.length} records as PDF` : 'No data to download'}
        >
          📥 Download PDF Report ({filteredData ? filteredData.length : 0} records)
        </button>
        <p className="download-hint">
          {periodType === 'daily' && selectedDate
            ? `Date: ${selectedDate}`
            : periodType === 'weekly' && filters.dateRange?.start && filters.dateRange?.end
            ? `Week: ${formatDateDDMMYYYY(filters.dateRange.start)} to ${formatDateDDMMYYYY(filters.dateRange.end)}`
            : periodType === 'monthly' && selectedMonth
            ? `Month: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            : filters.dateRange?.start && filters.dateRange?.end
            ? `Range: ${formatDateDDMMYYYY(filters.dateRange.start)} to ${formatDateDDMMYYYY(filters.dateRange.end)}`
            : 'All dates'
          }
        </p>
      </div>
    </div>
  );
}

export default Filters;
