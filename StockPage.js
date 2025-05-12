import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const timeOptions = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
];

function StockPage() {
  const [stockData, setStockData] = useState([]);
  const [timeFrame, setTimeFrame] = useState(5);
  const [average, setAverage] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        // Replace with actual API endpoint and parameters
        const response = await axios.get(`/api/stocks/prices?lastMinutes=${timeFrame}`);
        const data = response.data;

        // Assuming data is an array of { timestamp, price }
        setStockData(data);

        if (data.length > 0) {
          const avg = data.reduce((acc, cur) => acc + cur.price, 0) / data.length;
          setAverage(avg);
        } else {
          setAverage(0);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockData([]);
        setAverage(0);
      }
    }

    fetchStockData();
  }, [timeFrame]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: 10 }}>
          <p><strong>Time:</strong> {new Date(point.timestamp).toLocaleTimeString()}</p>
          <p><strong>Price:</strong> ${point.price.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Stock Price Chart</h2>
      <label>
        Select Time Frame:{' '}
        <select value={timeFrame} onChange={e => setTimeFrame(Number(e.target.value))}>
          {timeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={stockData}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setHoveredPoint(state.activePayload ? state.activePayload[0].payload : null);
            } else {
              setHoveredPoint(null);
            }
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={timeStr => new Date(timeStr).toLocaleTimeString()} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={true} />
          <ReferenceLine y={average} label="Average" stroke="red" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
      {hoveredPoint && (
        <div style={{ marginTop: 10 }}>
          <strong>Selected Point Details:</strong>
          <p>Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}</p>
          <p>Price: ${hoveredPoint.price.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default StockPage;
