import React, { useState } from 'react';
import './CarPricePredictor.css';
import AnalyticsDashboard from './AnalyticsDashboard';

const CarPricePredictor = () => {
  const [formData, setFormData] = useState({
    year: 2020,
    power_kw: 120,
    power_ps: 163,
    fuel_consumption_l_100km: 6.5,
    mileage_in_km: 50000,
    car_age: 3,
    registration_month: 6
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock prediction based on form data
      const basePrice = 25000;
      const yearFactor = (formData.year - 2015) * 2000;
      const mileageFactor = -(formData.mileage_in_km / 1000) * 50;
      const ageFactor = -(formData.car_age * 1500);
      const powerFactor = (formData.power_ps - 100) * 100;
      const fuelFactor = (10 - formData.fuel_consumption_l_100km) * 500;
      
      const predictedPrice = Math.max(0, basePrice + yearFactor + mileageFactor + ageFactor + powerFactor + fuelFactor);
      
      setPrediction({
        predicted_price: Math.round(predictedPrice),
        confidence: 'High',
        factors: {
          year: yearFactor,
          mileage: mileageFactor,
          age: ageFactor,
          power: powerFactor,
          fuel: fuelFactor
        }
      });
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h1>🚗 Car Value Predictor</h1>
        <p>Get an instant market value estimate for your vehicle</p>
      </div>

      <div className="predictor-content">
        {/* Input Form */}
        <div className="input-section">
          <h2>Vehicle Specifications</h2>
          
          <div className="input-grid">
            <div className="input-group">
              <label>Manufacturing Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min={1990}
                max={2024}
                placeholder="2020"
              />
            </div>

            <div className="input-group">
              <label>Power (kW)</label>
              <input
                type="number"
                name="power_kw"
                value={formData.power_kw}
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
                value={formData.power_ps}
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
                value={formData.fuel_consumption_l_100km}
                onChange={handleInputChange}
                min={3}
                max={20}
                placeholder="6.5"
              />
            </div>

            <div className="input-group">
              <label>Mileage (km)</label>
              <input
                type="number"
                name="mileage_in_km"
                value={formData.mileage_in_km}
                onChange={handleInputChange}
                min={0}
                max={500000}
                placeholder="50000"
              />
            </div>

            <div className="input-group">
              <label>Car Age (years)</label>
              <input
                type="number"
                name="car_age"
                value={formData.car_age}
                onChange={handleInputChange}
                min={0}
                max={30}
                placeholder="3"
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
                  <li className={formData.mileage_in_km < 100000 ? 'positive' : 'negative'}>
                    {formData.mileage_in_km < 100000 ? '✅' : '❌'} Mileage: {formData.mileage_in_km.toLocaleString()} km
                  </li>
                  <li className={formData.year > 2018 ? 'positive' : 'negative'}>
                    {formData.year > 2018 ? '✅' : '❌'} Model Year: {formData.year}
                  </li>
                  <li className={formData.fuel_consumption_l_100km < 8 ? 'positive' : 'negative'}>
                    {formData.fuel_consumption_l_100km < 8 ? '✅' : '❌'} Fuel Efficiency: {formData.fuel_consumption_l_100km}L/100km
                  </li>
                  <li className={formData.power_ps > 150 ? 'positive' : 'negative'}>
                    {formData.power_ps > 150 ? '✅' : '❌'} Power: {formData.power_ps} PS
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {prediction && (
          <AnalyticsDashboard prediction={prediction} formData={formData} />
        )}
      </div>
    </div>
  );
};

export default CarPricePredictor;
