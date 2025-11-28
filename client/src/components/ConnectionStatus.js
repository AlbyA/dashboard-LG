import React, { useMemo, useRef, forwardRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDateDDMMYYYY, formatDateYYYYMMDD } from '../utils/dateUtils';
import './ConnectionStatus.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ConnectionStatus = forwardRef(({ data }, ref) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    lineChart: lineChartRef.current,
    pieChart: pieChartRef.current
  }));

  // Helper function to format status labels for display in charts
  const formatStatusLabel = (status) => {
    return status === 'Pending' ? 'Unfit Leads' : status;
  };

  const dailyTrends = useMemo(() => {
    const trends = {};
    data.forEach(row => {
      // Use Date Generated column
      const dateGenerated = row['Date Generated'];
      if (dateGenerated && dateGenerated instanceof Date && !isNaN(dateGenerated.getTime()) && row['Connection Status']) {
        try {
          const date = formatDateYYYYMMDD(dateGenerated);
          if (!trends[date]) {
            trends[date] = {};
          }
          const status = row['Connection Status'];
          const displayStatus = formatStatusLabel(status);
          trends[date][displayStatus] = (trends[date][displayStatus] || 0) + 1;
        } catch (e) {
          // Skip invalid dates
          console.warn('Invalid date:', dateGenerated);
        }
      }
    });
    return Object.entries(trends)
      .map(([date, statuses]) => ({
        date,
        ...statuses
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const statusDistribution = useMemo(() => {
    const counts = {};
    data.forEach(row => {
      if (row['Connection Status']) {
        const status = row['Connection Status'];
        const displayStatus = formatStatusLabel(status);
        counts[displayStatus] = (counts[displayStatus] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (dailyTrends.length === 0 && statusDistribution.length === 0) {
    return (
      <div className="connection-status-section">
        <h2>🔗 Connection Status Analysis</h2>
        <p className="no-data">No connection status data available</p>
      </div>
    );
  }

  return (
    <div className="connection-status-section">
      <h2>🔗 Connection Status Analysis</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Daily Trends</h3>
          {dailyTrends.length > 0 ? (
            <div ref={lineChartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(dateStr) => {
                    try {
                      const date = new Date(dateStr);
                      if (!isNaN(date.getTime())) {
                        return formatDateDDMMYYYY(date);
                      }
                    } catch (e) {}
                    return dateStr;
                  }}
                  tick={{ fill: '#5a6c7d' }}
                />
                <YAxis 
                  tick={{ fill: '#5a6c7d' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: '#2c3e50'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#2c3e50' }}
                  formatter={(value) => <span style={{ color: '#2c3e50' }}>{value}</span>}
                />
                {dailyTrends.length > 0 && Object.keys(dailyTrends[0] || {}).filter(k => k !== 'date').map((status, idx) => (
                  <Line 
                    key={status} 
                    type="monotone" 
                    dataKey={status} 
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No date data available for trend analysis</p>
          )}
        </div>
        <div className="chart-container">
          <h3>Distribution</h3>
          {statusDistribution.length > 0 ? (
            <div ref={pieChartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent < 0.08) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="#2c3e50" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={500}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: '#2c3e50'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#2c3e50' }}
                  formatter={(value) => <span style={{ color: '#2c3e50' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No connection status data available</p>
          )}
        </div>
      </div>
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;

