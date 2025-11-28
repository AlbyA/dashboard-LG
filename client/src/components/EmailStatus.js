import React, { useState, useMemo, useRef, forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './EmailStatus.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const EmailStatus = forwardRef(({ data }, ref) => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    barChart: barChartRef.current,
    pieChart: pieChartRef.current
  }));
  const emailColumns = [
    'Notification Email Sent (on accepting invitation)',
    'Email Status 1',
    'Email Status 2'
  ];

  const availableEmailCols = emailColumns.filter(col => 
    data.some(row => row[col] && row[col] !== '')
  );

  const [selectedEmailCol, setSelectedEmailCol] = useState(
    availableEmailCols.length > 0 ? availableEmailCols[0] : null
  );

  const emailBarData = useMemo(() => {
    return availableEmailCols.map(col => {
      const totalCount = data.filter(row => row[col] && row[col] !== '').length;
      return {
        emailType: col.length > 40 ? col.substring(0, 40) + '...' : col,
        count: totalCount
      };
    });
  }, [data, availableEmailCols]);

  const selectedEmailPieData = useMemo(() => {
    if (!selectedEmailCol) return [];
    const statusCounts = {};
    data.forEach(row => {
      if (row[selectedEmailCol]) {
        const status = row[selectedEmailCol];
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data, selectedEmailCol]);

  if (availableEmailCols.length === 0) {
    return (
      <div className="email-status-section">
        <h2>📧 Email Status Analysis</h2>
        <p className="no-data">Email status columns not available</p>
      </div>
    );
  }

  return (
    <div className="email-status-section">
      <h2>📧 Email Status Analysis</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Email Status Distribution</h3>
          {emailBarData.length > 0 ? (
            <div ref={barChartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={emailBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="emailType" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No email status data available</p>
          )}
        </div>
        <div className="chart-container">
          <h3>Selected Email Status</h3>
          <select 
            value={selectedEmailCol || ''} 
            onChange={(e) => setSelectedEmailCol(e.target.value)}
            className="email-select"
          >
            {availableEmailCols.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {selectedEmailPieData.length > 0 ? (
            <div ref={pieChartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                <Pie
                  data={selectedEmailPieData}
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
                  {selectedEmailPieData.map((entry, index) => (
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
            <p className="no-data">No data for selected email status</p>
          )}
        </div>
      </div>
    </div>
  );
});

EmailStatus.displayName = 'EmailStatus';

export default EmailStatus;

