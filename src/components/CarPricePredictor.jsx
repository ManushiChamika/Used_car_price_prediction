import React, { useState, useEffect } from 'react';
import './CarPricePredictor.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import Recommendations from './Recommendations';

const CarPricePredictor = () => {
  const [carData, setCarData] = useState({
    year: 2020,
    power_kw: 120,
    power_ps: 163,
    fuel_consumption_l_100km: 6.5,
    fuel_consumption_g_km: 120,
    mileage_in_km: 50000,
    registration_month: 6,
    brand: 'audi',
    color: 'black',
    transmission_type: 'manual',
    fuel_type: 'petrol'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    brands: [],
    colors: [],
    transmission_types: [],
    fuel_types: []
  });

  // Load options from backend
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/options');
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error loading options:', error);
        // Fallback options
        setOptions({
          brands: ['audi', 'bmw', 'ford', 'hyundai', 'kia', 'fiat', 'citroen', 'dacia', 'land-rover', 'mazda'],
          colors: ['black', 'grey', 'white', 'blue', 'silver', 'red', 'brown', 'green', 'orange', 'yellow'],
          transmission_types: ['manual', 'automatic', 'semi-automatic'],
          fuel_types: ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'ethanol', 'hydrogen', 'other', 'unknown']
        });
      }
    };
    loadOptions();
  }, []);

  // Load history from localStorage once
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ucp_history') || '[]');
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {}
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarData({
      ...carData,
      [name]: name.includes('year') || name.includes('power') || name.includes('fuel_consumption') || name.includes('mileage') || name.includes('registration_month') 
        ? parseFloat(value) || 0 
        : value
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData)
      });
      const result = await response.json();
      
      if (result.success) {
        setPrediction(result);
        // Save to history (max 10)
        const entry = { timestamp: Date.now(), input: carData, output: result };
        const next = [entry, ...history].slice(0, 10);
        setHistory(next);
        try { localStorage.setItem('ucp_history', JSON.stringify(next)); } catch {}
        // Fetch recommendations
        fetchRecommendations(result);
      } else {
        console.error('Prediction failed:', result.error);
      }
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  const fetchRecommendations = async (pred) => {
    setRecsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...carData, predicted_price: pred?.predicted_price })
      });
      const res = await response.json();
      if (res.success) {
        setRecommendations(res.items || []);
      } else {
        setRecommendations([]);
      }
    } catch (e) {
      console.error('Recommend error:', e);
      setRecommendations([]);
    }
    setRecsLoading(false);
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h1>🚗 Car Value Predictor</h1>
        <p>Get an instant market value estimate for your vehicle</p>
      </div>

      <div className="predictor-content">
        {/* Input Section - No Form, Direct Data Input */}
        <div className="input-section">
          <h2>Vehicle Specifications</h2>
          
          <div className="input-grid">
            <div className="input-group">
              <label>Manufacturing Year</label>
              <input
                type="number"
                name="year"
                value={carData.year}
                onChange={handleInputChange}
                min={1990}
                max={2024}
                placeholder="2020"
              />
            </div>

            <div className="input-group">
              <label>Brand</label>
              <select
                name="brand"
                value={carData.brand}
                onChange={handleInputChange}
              >
                {options.brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand.charAt(0).toUpperCase() + brand.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Color</label>
              <select
                name="color"
                value={carData.color}
                onChange={handleInputChange}
              >
                {options.colors.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Transmission Type</label>
              <select
                name="transmission_type"
                value={carData.transmission_type}
                onChange={handleInputChange}
              >
                {options.transmission_types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Fuel Type</label>
              <select
                name="fuel_type"
                value={carData.fuel_type}
                onChange={handleInputChange}
              >
                {options.fuel_types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Power (kW)</label>
              <input
                type="number"
                name="power_kw"
                value={carData.power_kw}
                onChange={handleInputChange}
                min={50}
                max={500}
                placeholder="120"
              />
            </div>

            <div className="input-group">
              <label>Power (PS)</label>
              <input
                type="number"
                name="power_ps"
                value={carData.power_ps}
                onChange={handleInputChange}
                min={68}
                max={680}
                placeholder="163"
              />
            </div>

            <div className="input-group">
              <label>Fuel Consumption (L/100km)</label>
              <input
                type="number"
                step="0.1"
                name="fuel_consumption_l_100km"
                value={carData.fuel_consumption_l_100km}
                onChange={handleInputChange}
                min={3}
                max={20}
                placeholder="6.5"
              />
            </div>

            <div className="input-group">
              <label>Fuel Consumption (g/km)</label>
              <input
                type="number"
                name="fuel_consumption_g_km"
                value={carData.fuel_consumption_g_km}
                onChange={handleInputChange}
                min={50}
                max={300}
                placeholder="120"
              />
            </div>

            <div className="input-group">
              <label>Mileage (km)</label>
              <input
                type="number"
                name="mileage_in_km"
                value={carData.mileage_in_km}
                onChange={handleInputChange}
                min={0}
                max={500000}
                placeholder="50000"
              />
            </div>

            <div className="input-group">
              <label>Registration Month</label>
              <input
                type="number"
                name="registration_month"
                value={carData.registration_month}
                onChange={handleInputChange}
                min={1}
                max={12}
                placeholder="6"
              />
            </div>
          </div>

          <button 
            className="predict-button"
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Calculating...
              </>
            ) : (
              <>
                🚀 Get Price Estimate
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {prediction && (
          <div className="results-section">
            <h2>💰 Price Estimation</h2>
            <div className="price-card">
              <div className="estimated-price">
                €{prediction.predicted_price?.toLocaleString() || 'N/A'}
              </div>
              <div className="confidence">
                <span className={`confidence-badge ${prediction.confidence.toLowerCase()}`}>
                  {prediction.confidence} Confidence
                </span>
              </div>
              
              <div className="price-breakdown">
                <h4>Factors Affecting Price:</h4>
                <ul>
                  <li className={carData.mileage_in_km < 100000 ? 'positive' : 'negative'}>
                    {carData.mileage_in_km < 100000 ? '✅' : '❌'} Mileage: {carData.mileage_in_km.toLocaleString()} km
                  </li>
                  <li className={carData.year > 2018 ? 'positive' : 'negative'}>
                    {carData.year > 2018 ? '✅' : '❌'} Model Year: {carData.year}
                  </li>
                  <li className={carData.fuel_consumption_l_100km < 8 ? 'positive' : 'negative'}>
                    {carData.fuel_consumption_l_100km < 8 ? '✅' : '❌'} Fuel Efficiency: {carData.fuel_consumption_l_100km}L/100km
                  </li>
                  <li className={carData.power_ps > 150 ? 'positive' : 'negative'}>
                    {carData.power_ps > 150 ? '✅' : '❌'} Power: {carData.power_ps} PS
                  </li>
                  <li className={['audi', 'bmw', 'land-rover'].includes(carData.brand) ? 'positive' : 'neutral'}>
                    {['audi', 'bmw', 'land-rover'].includes(carData.brand) ? '✅' : '⚪'} Brand: {carData.brand.charAt(0).toUpperCase() + carData.brand.slice(1)}
                  </li>
                  <li className={['electric', 'hybrid'].includes(carData.fuel_type) ? 'positive' : 'neutral'}>
                    {['electric', 'hybrid'].includes(carData.fuel_type) ? '✅' : '⚪'} Fuel Type: {carData.fuel_type.charAt(0).toUpperCase() + carData.fuel_type.slice(1)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {prediction && (
          <AnalyticsDashboard prediction={prediction} carData={carData} />
        )}

        {/* Recommendations */}
        {prediction && (
          <Recommendations
            loading={recsLoading}
            items={recommendations}
            targetPrice={prediction.predicted_price}
          />
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="history-section">
            <h3>🕘 Recent Estimates</h3>
            <div className="history-grid">
              {history.slice(0, 6).map((h) => (
                <div key={h.timestamp} className="history-card" title={new Date(h.timestamp).toLocaleString()}>
                  <div className="history-price">€{h.output?.predicted_price?.toLocaleString?.() || '—'}</div>
                  <div className="history-meta">
                    <span>{h.input.brand}</span>
                    <span>• {h.input.year}</span>
                    <span>• {h.input.power_ps} PS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarPricePredictor;
