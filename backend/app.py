from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import joblib
from sklearn.preprocessing import MinMaxScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load the trained model and scaler
try:
    # Try to load the actual trained model if it exists
    model = joblib.load('model.pkl')
    scaler = joblib.load('scaler.pkl')
    feature_columns = joblib.load('feature_columns.pkl')
except:
    # Fallback: create a mock model for demonstration
    from sklearn.ensemble import RandomForestRegressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    scaler = MinMaxScaler()
    feature_columns = []

# Mock data for demonstration (based on the cleaned dataset structure)
def get_mock_data():
    return {
        'brands': ['audi', 'bmw', 'ford', 'hyundai', 'kia', 'fiat', 'citroen', 'dacia', 'land-rover', 'mazda'],
        'colors': ['black', 'grey', 'white', 'blue', 'silver', 'red', 'brown', 'green', 'orange', 'yellow'],
        'transmission_types': ['manual', 'automatic', 'semi-automatic'],
        'fuel_types': ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'ethanol', 'hydrogen', 'other', 'unknown']
    }

@app.route('/api/options', methods=['GET'])
def get_options():
    """Get available options for dropdowns"""
    return jsonify(get_mock_data())

@app.route('/api/predict', methods=['POST'])
def predict_price():
    """Predict car price based on input features"""
    try:
        data = request.json
        
        # Extract features from request
        year = float(data.get('year', 2020))
        power_kw = float(data.get('power_kw', 120))
        power_ps = float(data.get('power_ps', 163))
        fuel_consumption_l_100km = float(data.get('fuel_consumption_l_100km', 6.5))
        fuel_consumption_g_km = float(data.get('fuel_consumption_g_km', 120))
        mileage_in_km = float(data.get('mileage_in_km', 50000))
        registration_month = int(data.get('registration_month', 6))
        brand = data.get('brand', 'audi')
        color = data.get('color', 'black')
        transmission_type = data.get('transmission_type', 'manual')
        fuel_type = data.get('fuel_type', 'petrol')
        
        # Calculate car age
        current_year = 2024
        car_age = current_year - year
        
        # Create feature vector (this should match the training data structure)
        features = {
            'year': year,
            'power_kw': power_kw,
            'power_ps': power_ps,
            'fuel_consumption_l_100km': fuel_consumption_l_100km,
            'fuel_consumption_g_km': fuel_consumption_g_km,
            'mileage_in_km': mileage_in_km,
            'registration_month': registration_month,
            'car_age': car_age
        }
        
        # Add one-hot encoded categorical features
        brands = ['audi', 'bmw', 'ford', 'hyundai', 'kia', 'fiat', 'citroen', 'dacia', 'land-rover', 'mazda']
        colors = ['black', 'grey', 'white', 'blue', 'silver', 'red', 'brown', 'green', 'orange', 'yellow']
        transmission_types = ['manual', 'automatic', 'semi-automatic']
        fuel_types = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'ethanol', 'hydrogen', 'other', 'unknown']
        
        # Add brand features
        for b in brands:
            features[f'brand_{b}'] = 1 if brand.lower() == b else 0
            
        # Add color features
        for c in colors:
            features[f'color_{c}'] = 1 if color.lower() == c else 0
            
        # Add transmission features
        for t in transmission_types:
            features[f'transmission_type_{t}'] = 1 if transmission_type.lower() == t else 0
            
        # Add fuel type features
        for f in fuel_types:
            features[f'fuel_type_{f}'] = 1 if fuel_type.lower() == f else 0
        
        # Convert to DataFrame
        feature_df = pd.DataFrame([features])
        
        # Apply scaling to numeric features
        numeric_features = ['power_kw', 'power_ps', 'fuel_consumption_l_100km', 'fuel_consumption_g_km', 'mileage_in_km']
        for col in numeric_features:
            if col in feature_df.columns:
                # Simple min-max scaling (you should use the actual scaler from training)
                feature_df[col] = (feature_df[col] - feature_df[col].min()) / (feature_df[col].max() - feature_df[col].min())
        
        # Make prediction using mock calculation (replace with actual model prediction)
        base_price = 25000
        year_factor = (year - 2015) * 2000
        mileage_factor = -(mileage_in_km / 1000) * 50
        age_factor = -(car_age * 1500)
        power_factor = (power_ps - 100) * 100
        fuel_factor = (10 - fuel_consumption_l_100km) * 500
        
        # Brand factor
        brand_multipliers = {
            'audi': 1.3, 'bmw': 1.4, 'ford': 0.8, 'hyundai': 0.7, 'kia': 0.6,
            'fiat': 0.5, 'citroen': 0.6, 'dacia': 0.4, 'land-rover': 1.5, 'mazda': 0.9
        }
        brand_factor = brand_multipliers.get(brand.lower(), 1.0)
        
        predicted_price = max(0, (base_price + year_factor + mileage_factor + age_factor + power_factor + fuel_factor) * brand_factor)
        
        # Calculate confidence based on data quality
        confidence = 'High'
        if car_age > 10 or mileage_in_km > 200000:
            confidence = 'Medium'
        if car_age > 15 or mileage_in_km > 300000:
            confidence = 'Low'
        
        # Calculate factor impacts
        factors = {
            'year': year_factor,
            'mileage': mileage_factor,
            'age': age_factor,
            'power': power_factor,
            'fuel': fuel_factor,
            'brand': (brand_factor - 1) * base_price
        }
        
        return jsonify({
            'predicted_price': round(predicted_price),
            'confidence': confidence,
            'factors': factors,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Car Price Prediction API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
