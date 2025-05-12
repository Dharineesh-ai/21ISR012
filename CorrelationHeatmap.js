import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CorrelationHeatmap() {
  const [correlationData, setCorrelationData] = useState([]);
  const [timeFrame, setTimeFrame] = useState(5);
  const [hoveredStock, setHoveredStock] = useState(null);
  const [stats, setStats] = useState({ average: 0, stddev: 0 });

  useEffect(() => {
    async function fetchCorrelationData() {
      try {
        // Replace with actual API endpoint and parameters
        const response = await axios.get(`/api/stocks/correlation?lastMinutes=${timeFrame}`);
        const data = response.data; // Expected to be a 2D array or matrix of correlations
        setCorrelationData(data);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
        setCorrelationData([]);
      }
    }

    fetchCorrelationData();
  }, [timeFrame]);

  // Calculate average and stddev for hovered stock
  useEffect(() => {
    if (hoveredStock !== null && correlationData.length > 0) {
      const prices = correlationData[hoveredStock]?.prices || [];
      if (prices.length > 0) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + (b - avg) ** 2, 0) / prices.length;
        const stddev = Math.sqrt(variance);
        setStats({ average: avg, stddev });
      } else {
        setStats({ average: 0, stddev: 0 });
      }
    } else {
      setStats({ average: 0, stddev: 0 });
    }
  }, [hoveredStock, correlationData]);

  const colors = [
    '#d73027', // strong negative
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850', // strong positive
  ];

  const getColor = (value) => {
    // value expected between -1 and 1
    const index = Math.floor(((value + 1) / 2) * (colors.length - 1));
    return colors[index];
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Correlation Heatmap</h2>
      <label>
        Select Time Frame:{' '}
        <select value={timeFrame} onChange={e => setTimeFrame(Number(e.target.value))}>
          {[5, 15, 30, 60].map(min => (
            <option key={min} value={min}>{min} minutes</option>
          ))}
        </select>
      </label>
      <div style={{ overflowX: 'auto', marginTop: 20 }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th></th>
              {correlationData.map((stock, idx) => (
                <th
                  key={idx}
                  onMouseEnter={() => setHoveredStock(idx)}
                  onMouseLeave={() => setHoveredStock(null)}
                  style={{ padding: 5, cursor: 'pointer', backgroundColor: hoveredStock === idx ? '#eee' : 'transparent' }}
                >
                  {stock.name || `Stock ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correlationData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td
                  onMouseEnter={() => setHoveredStock(rowIndex)}
                  onMouseLeave={() => setHoveredStock(null)}
                  style={{ padding: 5, cursor: 'pointer', backgroundColor: hoveredStock === rowIndex ? '#eee' : 'transparent' }}
                >
                  {row.name || `Stock ${rowIndex + 1}`}
                </td>
                {row.correlations ? row.correlations.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      backgroundColor: getColor(value),
                      width: 30,
                      height: 30,
                      textAlign: 'center',
                      color: Math.abs(value) > 0.5 ? 'white' : 'black',
                      fontSize: 12,
                    }}
                  >
                    {value.toFixed(2)}
                  </td>
                )) : <td colSpan={correlationData.length}>No data</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hoveredStock !== null && (
        <div style={{ marginTop: 10 }}>
          <strong>Stock Stats:</strong>
          <p>Average Price: {stats.average.toFixed(2)}</p>
          <p>Standard Deviation: {stats.stddev.toFixed(2)}</p>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <strong>Color Legend:</strong>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ backgroundColor: colors[0], width: 20, height: 20, display: 'inline-block', marginRight: 5 }}></span> Strong Negative
          <span style={{ backgroundColor: colors[colors.length - 1], width: 20, height: 20, display: 'inline-block', marginLeft: 20, marginRight: 5 }}></span> Strong Positive
        </div>
      </div>
    </div>
  );
}

export default CorrelationHeatmap;
