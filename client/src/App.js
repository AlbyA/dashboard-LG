import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import KPICards from './components/KPICards';
import ConnectionStatus from './components/ConnectionStatus';
import EmailStatus from './components/EmailStatus';
import FitScoreAnalysis from './components/FitScoreAnalysis';
import Filters from './components/Filters';
import AdditionalInsights from './components/AdditionalInsights';
import { parseDateDDMMYYYY } from './utils/dateUtils';

function App() {
  const connectionStatusRef = useRef(null);
  const emailStatusRef = useRef(null);
  const fitScoreRef = useRef(null);
  const additionalInsightsRef = useRef(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: null,
    connectionStatus: 'All',
    fitScoreRange: null,
    periodType: 'all',
  });

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use environment variable for API URL, fallback to relative path
      const apiUrl = process.env.REACT_APP_API_URL || '/api/data';
      const response = await axios.get(apiUrl);
      const processedData = processData(response.data);
      setData(processedData);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load data.';
      const errorDetails = err.response?.data?.details || '';
      setError(`Error: ${errorMessage}${errorDetails ? `\n\nDetails: ${errorDetails}` : ''}`);
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    return rawData.map(row => {
      let dateGenerated = null;
      if (row['Date Generated']) {
        // Parse Date Generated column (dd/mm/yyyy format)
        dateGenerated = parseDateDDMMYYYY(row['Date Generated']);
      }
      
      let fitScore = null;
      if (row['Fit Score'] && row['Fit Score'] !== '') {
        const score = parseFloat(row['Fit Score']);
        fitScore = isNaN(score) ? null : score;
      }
      
      let experience = null;
      if (row['Experience (Years)'] && row['Experience (Years)'] !== '') {
        const exp = parseFloat(row['Experience (Years)']);
        experience = isNaN(exp) ? null : exp;
      }
      
      return {
        ...row,
        'Date Generated': dateGenerated,
        'Fit Score': fitScore,
        'Experience (Years)': experience,
      };
    }).filter(row => row['Date Generated'] || row['Fit Score'] !== null);
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Date range filter (using Date Generated column)
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(row => {
        const dateGenerated = row['Date Generated'];
        if (!dateGenerated || !(dateGenerated instanceof Date) || isNaN(dateGenerated.getTime())) {
          return false;
        }
        
        // Compare dates ignoring time
        const rowDate = new Date(dateGenerated.getFullYear(), dateGenerated.getMonth(), dateGenerated.getDate());
        const startDate = new Date(filters.dateRange.start.getFullYear(), filters.dateRange.start.getMonth(), filters.dateRange.start.getDate());
        const endDate = new Date(filters.dateRange.end.getFullYear(), filters.dateRange.end.getMonth(), filters.dateRange.end.getDate());
        
        return rowDate >= startDate && rowDate <= endDate;
      });
    }

    // Connection Status filter
    if (filters.connectionStatus !== 'All') {
      filtered = filtered.filter(row => row['Connection Status'] === filters.connectionStatus);
    }

    // Fit Score range filter
    if (filters.fitScoreRange && filters.fitScoreRange.min !== null && filters.fitScoreRange.max !== null) {
      filtered = filtered.filter(row => {
        const score = row['Fit Score'];
        return score !== null && score >= filters.fitScoreRange.min && score <= filters.fitScoreRange.max;
      });
    }

    setFilteredData(filtered);
  };

  if (loading && data.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data from Google Sheets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>📊 Lead Management Dashboard</h1>
        <button onClick={fetchData} className="refresh-btn">🔄 Refresh</button>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>📋 Data Info</h3>
            <p>Total Records: {data.length}</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
          </div>
          <Filters 
            data={data} 
            filters={filters} 
            setFilters={setFilters} 
            filteredData={filteredData}
            chartRefs={{
              connectionStatus: connectionStatusRef,
              emailStatus: emailStatusRef,
              fitScore: fitScoreRef,
              additionalInsights: additionalInsightsRef
            }}
          />
        </aside>

        <main className="main-content">
          <KPICards data={filteredData} />
          <ConnectionStatus ref={connectionStatusRef} data={filteredData} />
          <EmailStatus ref={emailStatusRef} data={filteredData} />
          <FitScoreAnalysis ref={fitScoreRef} data={filteredData} />
          <AdditionalInsights ref={additionalInsightsRef} data={filteredData} />
        </main>
      </div>
    </div>
  );
}

export default App;

