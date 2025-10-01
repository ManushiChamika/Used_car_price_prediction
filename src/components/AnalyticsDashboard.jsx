import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const AnalyticsDashboard = ({ prediction, carData }) => {
  // Sample data for visualization
  const priceFactors = [
    { factor: 'Mileage', impact: Math.round(prediction.factors.mileage), color: '#8884d8' },
    { factor: 'Age', impact: Math.round(prediction.factors.age), color: '#82ca9d' },
    { factor: 'Power', impact: Math.round(prediction.factors.power), color: '#ffc658' },
    { factor: 'Fuel Efficiency', impact: Math.round(prediction.factors.fuel), color: '#ff7300' },
    { factor: 'Brand', impact: Math.round(prediction.factors.brand), color: '#00c49f' }
  ];

  const marketTrends = [
    { year: '2019', avgPrice: 22000 },
    { year: '2020', avgPrice: 23500 },
    { year: '2021', avgPrice: 25000 },
    { year: '2022', avgPrice: 26500 },
    { year: '2023', avgPrice: 28000 },
    { year: '2024', avgPrice: 29500 }
  ];

  const carSegments = [
    { name: 'Economy', value: 35, color: '#0088FE' },
    { name: 'Mid-range', value: 45, color: '#00C49F' },
    { name: 'Luxury', value: 20, color: '#FFBB28' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}: €${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <h3>📊 Price Analysis & Market Insights</h3>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h4>Factors Impacting Price</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceFactors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="factor" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impact" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>Market Price Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>Market Segments</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={carSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {carSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>Your Car's Position</h4>
          <div className="position-card">
            <div className="position-item">
              <span className="position-label">Estimated Value:</span>
              <span className="position-value">€{prediction.predicted_price.toLocaleString()}</span>
            </div>
            <div className="position-item">
              <span className="position-label">Market Position:</span>
              <span className="position-value">
                {prediction.predicted_price > 25000 ? 'Above Average' : 'Below Average'}
              </span>
            </div>
            <div className="position-item">
              <span className="position-label">Depreciation Rate:</span>
              <span className="position-value">
                {Math.round(((2024 - carData.year) / carData.year) * 100)}% per year
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
