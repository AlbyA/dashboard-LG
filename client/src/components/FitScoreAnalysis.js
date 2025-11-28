import React, { useMemo, useRef, forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './FitScoreAnalysis.css';

const FitScoreAnalysis = forwardRef(({ data }, ref) => {
  const histogramRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    histogram: histogramRef.current
  }));
  const fitScores = useMemo(() => {
    return data
      .map(row => row['Fit Score'])
      .filter(score => score !== null && score !== '' && !isNaN(parseFloat(score)))
      .map(score => parseFloat(score))
      .filter(score => !isNaN(score));
  }, [data]);

  const stats = useMemo(() => {
    if (fitScores.length === 0) return null;
    
    const sorted = [...fitScores].sort((a, b) => a - b);
    const mean = fitScores.reduce((a, b) => a + b, 0) / fitScores.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const variance = fitScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / fitScores.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      average: mean.toFixed(2),
      minimum: Math.min(...fitScores).toFixed(2),
      maximum: Math.max(...fitScores).toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2)
    };
  }, [fitScores]);

  const histogramData = useMemo(() => {
    if (fitScores.length === 0) return [];
    
    const min = Math.min(...fitScores);
    const max = Math.max(...fitScores);
    const bins = 30;
    const binWidth = (max - min) / bins;
    
    const binsData = Array(bins).fill(0).map((_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      mid: min + (i + 0.5) * binWidth,
      count: 0
    }));
    
    fitScores.forEach(score => {
      const binIndex = Math.min(Math.max(0, Math.floor((score - min) / binWidth)), bins - 1);
      if (binsData[binIndex]) {
        binsData[binIndex].count++;
      }
    });
    
    return binsData;
  }, [fitScores]);

  const boxPlotData = useMemo(() => {
    if (fitScores.length === 0) return [];
    
    const sorted = [...fitScores].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return [{
      name: 'Fit Score',
      min: Math.min(...fitScores),
      q1: sorted[q1Index],
      median: sorted[q2Index],
      q3: sorted[q3Index],
      max: Math.max(...fitScores)
    }];
  }, [fitScores]);

  if (fitScores.length === 0) {
    return (
      <div className="fit-score-section">
        <h2>🎯 Fit Score Analysis</h2>
        <p className="no-data">No Fit Score data available</p>
      </div>
    );
  }

  return (
    <div className="fit-score-section">
      <h2>🎯 Fit Score Analysis</h2>
      
      <div className="fit-score-grid">
        <div className="stats-container">
          <h3>Statistics</h3>
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Average</td>
                <td>{stats.average}</td>
              </tr>
              <tr>
                <td>Minimum</td>
                <td>{stats.minimum}</td>
              </tr>
              <tr>
                <td>Maximum</td>
                <td>{stats.maximum}</td>
              </tr>
              <tr>
                <td>Median</td>
                <td>{stats.median}</td>
              </tr>
              <tr>
                <td>Standard Deviation</td>
                <td>{stats.stdDev}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="chart-container">
          <h3>Distribution (Histogram)</h3>
          <div ref={histogramRef}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mid" 
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="boxplot-container">
        <h3>Box Plot</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={boxPlotData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="min" fill="#8884d8" />
            <Bar dataKey="q1" fill="#82ca9d" />
            <Bar dataKey="median" fill="#ffc658" />
            <Bar dataKey="q3" fill="#ff8042" />
            <Bar dataKey="max" fill="#ff0000" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

FitScoreAnalysis.displayName = 'FitScoreAnalysis';

export default FitScoreAnalysis;

