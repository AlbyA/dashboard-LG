import React, { useMemo, useRef, forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdditionalInsights.css';

const AdditionalInsights = forwardRef(({ data }, ref) => {
  const employersRef = useRef(null);
  const locationsRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    employers: employersRef.current,
    locations: locationsRef.current
  }));
  const topEmployers = useMemo(() => {
    const counts = {};
    data.forEach(row => {
      if (row['Current Employer']) {
        const employer = row['Current Employer'];
        counts[employer] = (counts[employer] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const topLocations = useMemo(() => {
    const counts = {};
    data.forEach(row => {
      if (row['Location']) {
        const location = row['Location'];
        counts[location] = (counts[location] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="additional-insights-section">
      <h2>💡 Additional Insights</h2>
      <div className="insights-grid">
        <div className="insight-container">
          <h3>Top 10 Current Employers</h3>
          {topEmployers.length > 0 ? (
            <div ref={employersRef}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topEmployers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No employer data available</p>
          )}
        </div>
        
        <div className="insight-container">
          <h3>Top 10 Locations</h3>
          {topLocations.length > 0 ? (
            <div ref={locationsRef}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No location data available</p>
          )}
        </div>
      </div>
    </div>
  );
});

AdditionalInsights.displayName = 'AdditionalInsights';

export default AdditionalInsights;

