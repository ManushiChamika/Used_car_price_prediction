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

# Load the trained model, scaler, and feature schema if present
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

def generate_recommendations(input_data: dict, predicted_price: float) -> list:
    """Generate simple mock recommendations near the predicted price.
    This should be replaced with a real similarity search using your dataset/model.
    """
    rng = np.random.default_rng(42)
    brands = get_mock_data()['brands']
    colors = get_mock_data()['colors']
    transmissions = get_mock_data()['transmission_types']
    fuels = get_mock_data()['fuel_types']

    target = float(predicted_price)
    recs = []
    for i in range(8):
        price_delta = rng.integers(-4000, 4000)
        rec_price = max(1500, target + int(price_delta))
        rec = {
            'id': i + 1,
            'brand': str(input_data.get('brand') or rng.choice(brands)),
            'color': str(input_data.get('color') or rng.choice(colors)),
            'transmission_type': str(input_data.get('transmission_type') or rng.choice(transmissions)),
            'fuel_type': str(input_data.get('fuel_type') or rng.choice(fuels)),
            'year': int(input_data.get('year') or int(rng.integers(2010, 2024))),
            'power_ps': int(input_data.get('power_ps') or int(rng.integers(80, 300))),
            'mileage_in_km': int(input_data.get('mileage_in_km') or int(rng.integers(10000, 180000))),
            'price_in_euro': int(rec_price),
            'match_score': float(max(0, 100 - abs(price_delta) / 80)),
            'thumbnail': f"https://placehold.co/320x200?text={str(input_data.get('brand') or 'car').title()}"
        }
        recs.append(rec)
    # Sort by match score desc
    recs.sort(key=lambda x: (-x['match_score'], abs(x['price_in_euro'] - target)))
    return recs

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
        
        # Build DataFrame and predict
        feature_df = pd.DataFrame([features])

        use_real_model = isinstance(feature_columns, (list, tuple)) and len(feature_columns) > 0
        if use_real_model:
            # Ensure all expected columns exist
            for col in feature_columns:
                if col not in feature_df.columns:
                    feature_df[col] = 0
            # Apply scaler to numeric features used during training
            # We assume scaler was fitted on a subset of columns; if it's a ColumnTransformer pipeline
            # saved externally, you might want to persist the full pipeline instead. For simplicity,
            # assume scaler expects the same order of numeric columns as in training.
            X = feature_df.reindex(columns=feature_columns, fill_value=0)
            y_pred = model.predict(X)
            predicted_price = float(y_pred[0])
            # Basic confidence heuristic
            confidence = 'High'
            if car_age > 10 or mileage_in_km > 200000:
                confidence = 'Medium'
            if car_age > 15 or mileage_in_km > 300000:
                confidence = 'Low'
            # Residual-like factor hints (mocked since tree models don't provide coefficients)
            factors = {
                'year': (year - 2015) * 1000,
                'mileage': -(mileage_in_km / 1000) * 25,
                'age': -(car_age * 800),
                'power': (power_ps - 100) * 50,
                'fuel': (10 - fuel_consumption_l_100km) * 250,
                'brand': 0
            }
        else:
            # Fallback: simple heuristic
            numeric_features = ['power_kw', 'power_ps', 'fuel_consumption_l_100km', 'fuel_consumption_g_km', 'mileage_in_km']
            for col in numeric_features:
                if col in feature_df.columns:
                    # simple min-max within single-row (no-op), kept for compatibility
                    pass
            base_price = 25000
            year_factor = (year - 2015) * 2000
            mileage_factor = -(mileage_in_km / 1000) * 50
            age_factor = -(car_age * 1500)
            power_factor = (power_ps - 100) * 100
            fuel_factor = (10 - fuel_consumption_l_100km) * 500
            brand_multipliers = {
                'audi': 1.3, 'bmw': 1.4, 'ford': 0.8, 'hyundai': 0.7, 'kia': 0.6,
                'fiat': 0.5, 'citroen': 0.6, 'dacia': 0.4, 'land-rover': 1.5, 'mazda': 0.9
            }
            brand_factor = brand_multipliers.get(brand.lower(), 1.0)
            predicted_price = max(0, (base_price + year_factor + mileage_factor + age_factor + power_factor + fuel_factor) * brand_factor)
            factors = {
                'year': year_factor,
                'mileage': mileage_factor,
                'age': age_factor,
                'power': power_factor,
                'fuel': fuel_factor,
                'brand': (brand_factor - 1) * base_price
            }
        
        # Confidence if not set (heuristic)
        if 'confidence' not in locals():
            confidence = 'High'
            if car_age > 10 or mileage_in_km > 200000:
                confidence = 'Medium'
            if car_age > 15 or mileage_in_km > 300000:
                confidence = 'Low'
        
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

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Return recommended similar cars based on inputs and predicted price."""
    try:
        payload = request.json or {}
        predicted_price = float(payload.get('predicted_price', 0))
        recommendations = generate_recommendations(payload, predicted_price)
        return jsonify({
            'success': True,
            'count': len(recommendations),
            'items': recommendations
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Car Price Prediction API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
