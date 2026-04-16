import os
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error
import joblib
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'zameen_ml_model')
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── FEATURE ENGINEERING ─────────────────────────────────────────────
CITY_BASE_PRICE = {
    'Mumbai': 18000, 'Delhi': 12000, 'Gurgaon': 9000, 'Bangalore': 6500,
    'Hyderabad': 5500, 'Pune': 6000, 'Chennai': 7000, 'Kolkata': 5000,
    'Ahmedabad': 4500, 'Jaipur': 4000,
}

LOCALITY_MULT = {
    # Bangalore
    'Koramangala': 1.4, 'Indiranagar': 1.35, 'HSR Layout': 1.2, 'Whitefield': 1.1,
    'Electronic City': 0.9, 'Jayanagar': 1.3, 'JP Nagar': 1.1, 'Marathahalli': 1.0,
    # Mumbai
    'Bandra West': 2.0, 'Worli': 1.9, 'Lower Parel': 1.7, 'Juhu': 1.8,
    'Andheri West': 1.3, 'Powai': 1.2, 'Thane': 0.7, 'Navi Mumbai': 0.65,
    # Gurgaon
    'Golf Course Road': 1.6, 'DLF Phase 1': 1.5, 'DLF Phase 2': 1.45, 'Cyber City': 1.3,
    # Hyderabad
    'Banjara Hills': 1.7, 'Jubilee Hills': 1.65, 'Hitech City': 1.3, 'Gachibowli': 1.25,
    # Delhi
    'Defence Colony': 1.8, 'Greater Kailash': 1.7, 'South Extension': 1.6, 'Vasant Kunj': 1.4,
}

ENCODERS = {}
MODELS = {'buy': None, 'rent': None}

def generate_training_data(n=5000):
    """Generate synthetic training data matching Indian market patterns."""
    np.random.seed(42)
    cities = list(CITY_BASE_PRICE.keys())
    records = []

    for _ in range(n):
        city = np.random.choice(cities)
        base = CITY_BASE_PRICE[city]
        bhk = np.random.choice([1,1,2,2,2,3,3,3,4,4,5], p=[0.05,0.05,0.15,0.15,0.15,0.15,0.12,0.08,0.06,0.04,0.0])
        # fix bhk probabilities to sum to 1
        bhk = np.random.choice([1,2,2,3,3,4,5], p=[0.1,0.25,0.15,0.25,0.1,0.1,0.05])
        area = np.random.randint(400 + bhk*150, 900 + bhk*350)
        floor = np.random.randint(0, 21)
        total_floors = max(floor, np.random.randint(floor, floor+16))
        age = np.random.randint(0, 26)
        furn = np.random.choice(['Furnished','Semi-Furnished','Unfurnished'], p=[0.25,0.45,0.30])
        facing = np.random.choice(['East','West','North','South','North-East','North-West','South-East','South-West'])
        prop_type = np.random.choice(['Apartment','Villa','Independent House','Builder Floor','Studio'], p=[0.5,0.15,0.15,0.15,0.05])
        listing_type = np.random.choice(['Buy','Rent'], p=[0.65,0.35])
        locality_mult = np.random.uniform(0.65, 2.0)
        furn_mult = {'Furnished':1.15,'Semi-Furnished':1.05,'Unfurnished':1.0}[furn]
        age_mult = max(0.7, 1 - age * 0.012)
        floor_mult = 1 + (floor / max(total_floors, 1)) * 0.08
        noise = np.random.uniform(0.90, 1.10)
        type_mult = {'Villa':1.3,'Independent House':1.2,'Builder Floor':1.1,'Apartment':1.0,'Studio':0.85}[prop_type]

        if listing_type == 'Buy':
            price = int(base * locality_mult * area * furn_mult * age_mult * floor_mult * type_mult * noise)
        else:
            price = int(base * locality_mult * bhk * 0.55 * 12 * furn_mult * noise)

        records.append({
            'city': city, 'bhk': bhk, 'area_sqft': area, 'floor': floor,
            'total_floors': total_floors, 'age_years': age, 'furnished_status': furn,
            'facing': facing, 'property_type': prop_type, 'listing_type': listing_type,
            'locality_mult': locality_mult, 'price': price,
        })
    return pd.DataFrame(records)

def prepare_features(df):
    """Encode categorical features."""
    cats = ['city','furnished_status','facing','property_type']
    for col in cats:
        if col not in ENCODERS:
            ENCODERS[col] = LabelEncoder()
            df[f'{col}_enc'] = ENCODERS[col].fit_transform(df[col].astype(str))
        else:
            df[f'{col}_enc'] = df[col].astype(str).map(
                lambda x: ENCODERS[col].transform([x])[0] if x in ENCODERS[col].classes_ else 0
            )

    feature_cols = ['bhk','area_sqft','floor','total_floors','age_years','locality_mult',
                    'city_enc','furnished_status_enc','facing_enc','property_type_enc']
    return df[feature_cols]

def train_models():
    print("🤖 Training ML models...")
    df = generate_training_data(6000)
    
    buy_df = df[df['listing_type'] == 'Buy'].copy()
    rent_df = df[df['listing_type'] == 'Rent'].copy()

    for name, data in [('buy', buy_df), ('rent', rent_df)]:
        X = prepare_features(data.copy())
        y = data['price']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
        
        model = RandomForestRegressor(n_estimators=200, max_depth=12, min_samples_leaf=3, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        mape = mean_absolute_percentage_error(y_test, model.predict(X_test))
        print(f"  ✅ {name.upper()} model MAPE: {mape:.2%}")
        
        MODELS[name] = model
        joblib.dump(model, os.path.join(MODEL_DIR, f'{name}_model.pkl'))

    joblib.dump(ENCODERS, os.path.join(MODEL_DIR, 'encoders.pkl'))
    print("✅ Models saved!")

def load_models():
    global ENCODERS
    buy_path = os.path.join(MODEL_DIR, 'buy_model.pkl')
    if os.path.exists(buy_path):
        MODELS['buy'] = joblib.load(buy_path)
        MODELS['rent'] = joblib.load(os.path.join(MODEL_DIR, 'rent_model.pkl'))
        ENCODERS = joblib.load(os.path.join(MODEL_DIR, 'encoders.pkl'))
        print("✅ Existing models loaded")
    else:
        train_models()

# ─── ROUTES ──────────────────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'models': {'buy': MODELS['buy'] is not None, 'rent': MODELS['rent'] is not None}})

@app.route('/train', methods=['POST'])
def train():
    train_models()
    return jsonify({'message': 'Models retrained successfully'})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        city = data.get('city', 'Bangalore')
        bhk = int(data.get('bhk', 2))
        area = float(data.get('areaSqft', 1000))
        floor = int(data.get('floor', 0))
        total_floors = int(data.get('totalFloors', 5))
        age = int(data.get('ageYears', 0))
        furn = data.get('furnishedStatus', 'Semi-Furnished')
        facing = data.get('facing', 'East')
        prop_type = data.get('propertyType', 'Apartment')
        locality = data.get('locality', '')
        listing_type = data.get('listingType', 'Buy')

        locality_mult = LOCALITY_MULT.get(locality, 1.0)

        row = pd.DataFrame([{
            'city': city, 'bhk': bhk, 'area_sqft': area, 'floor': floor,
            'total_floors': total_floors, 'age_years': age, 'furnished_status': furn,
            'facing': facing, 'property_type': prop_type, 'listing_type': listing_type,
            'locality_mult': locality_mult,
        }])

        X = prepare_features(row)
        model_key = 'buy' if listing_type == 'Buy' else 'rent'
        model = MODELS[model_key]

        if model is None:
            return jsonify({'error': 'Model not trained'}), 503

        # Get prediction from each tree for confidence interval
        predictions = np.array([tree.predict(X)[0] for tree in model.estimators_])
        predicted = float(np.median(predictions))
        p10 = float(np.percentile(predictions, 10))
        p90 = float(np.percentile(predictions, 90))
        std = float(np.std(predictions))
        confidence = max(0.5, min(0.95, 1 - (std / predicted)))

        # Feature importance for this prediction
        feature_names = ['BHK','Area','Floor','Total Floors','Age','Locality','City','Furnished','Facing','Property Type']
        importances = model.feature_importances_
        top_factors = [
            {'factor': feature_names[i], 'impact': round(float(importances[i]) * 100, 1)}
            for i in np.argsort(importances)[::-1][:5]
        ]

        return jsonify({
            'predicted_price': round(predicted),
            'price_range': {'low': round(p10), 'high': round(p90)},
            'confidence': round(confidence, 2),
            'top_factors': top_factors,
            'model_used': f'RandomForest-{model_key.upper()}',
            'source': 'ml_model',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/market-analysis', methods=['POST'])
def market_analysis():
    """Analyze market trends for a city/locality."""
    data = request.json
    city = data.get('city', 'Bangalore')
    listing_type = data.get('listingType', 'Buy')
    
    base = CITY_BASE_PRICE.get(city, 5000)
    months = []
    price = base * 1000 * 0.85
    for i in range(12):
        change = np.random.uniform(-2, 5)
        price *= (1 + change/100)
        months.append({
            'month': i + 1,
            'avgPrice': round(price),
            'changePercent': round(change, 2),
        })

    return jsonify({'city': city, 'listingType': listing_type, 'trend': months})

if __name__ == '__main__':
    load_models()
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
