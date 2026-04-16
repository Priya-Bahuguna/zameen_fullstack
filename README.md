# 🏠 Zameen — Smart Property Intelligence Platform

India's most intelligent property platform with AI-powered pricing, area ratings, investment insights, and verified listings across all major Indian cities.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Python** 3.9+ (for ML API)

---

## 📁 Project Structure

```
zameen-fullstack/
├── frontend/          # React 18 app (CRA)
│   └── src/
│       ├── pages/     # All page components
│       ├── components/ # Reusable components
│       ├── context/   # Auth context
│       └── utils/     # API client & helpers
├── backend/           # Node.js + Express API
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Auth middleware
│   └── scripts/       # Seed script
└── ml-api/            # Python Flask ML service
    ├── app.py         # Random Forest model
    └── zameen_ml_model/ # Saved model files
```

---

## ⚙️ Setup & Run

### Step 1 — Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Frontend  
cd ../frontend
npm install
```

### Step 2 — Seed the Database

```bash
cd backend
node scripts/seedFromCSV.js
```

This generates **1000+ realistic Indian property listings** across 10 cities and seeds MongoDB.

Demo accounts created:
| Role   | Email                 | Password   |
|--------|-----------------------|------------|
| Admin  | admin@zameen.com      | admin123   |
| Seller | seller@zameen.com     | seller123  |
| Buyer  | buyer@zameen.com      | buyer123   |

### Step 3 — Run Backend

```bash
cd backend
npm run dev   # starts on http://localhost:5000
```

### Step 4 — Run ML API (Optional but recommended)

```bash
cd ml-api
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py               # starts on http://localhost:8000
```

> ℹ️ If ML API is not running, the backend uses a smart heuristic fallback for price estimates.

### Step 5 — Run Frontend

```bash
cd frontend
npm start    # starts on http://localhost:3000
```

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🏠 **Browse Properties** | Filter by city, locality, BHK, price, furnished status across all of India |
| 🤖 **AI Price Estimator** | Random Forest ML model estimates fair market price with confidence score |
| 📊 **Price History** | Track price trends over time for any locality |
| ⭐ **Area Ratings** | Community ratings across safety, schools, connectivity & 6 more parameters |
| 💰 **Investment Score** | Data-backed ROI scoring for every locality |
| 🔍 **Compare** | Side-by-side comparison of up to 3 localities |
| 📋 **Seller Dashboard** | List, manage, activate/deactivate listings |
| 🔒 **Auth** | JWT-based login/register with buyer & seller roles |
| ❤️ **Save Properties** | Bookmark properties (requires login) |

---

## 🌍 Supported Cities

Bangalore · Mumbai · Gurgaon · Hyderabad · Pune · Delhi · Chennai · Kolkata · Ahmedabad · Jaipur

Each city has **15 localities** with realistic pricing, area ratings, and investment scores.

---

## 🤖 ML Model Details

- **Algorithm**: Random Forest Regressor (200 estimators)
- **Training Data**: 6000 synthetic records modeled on real Indian market patterns
- **Features**: City, Locality, BHK, Area, Floor, Age, Furnished Status, Facing, Property Type
- **Output**: Predicted price + confidence interval (P10–P90) + top factors
- **Fallback**: Rule-based heuristic if Python API is down

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get profile |
| POST | /api/auth/save-property/:id | Save/unsave property |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/properties | List with filters |
| GET | /api/properties/:id | Single property |
| POST | /api/properties | Create listing |
| PUT | /api/properties/:id | Update listing |
| DELETE | /api/properties/:id | Delete listing |
| GET | /api/properties/cities | All cities |
| GET | /api/properties/localities/:city | Localities by city |
| GET | /api/properties/price-history/:city/:locality | Price history |
| GET | /api/properties/compare/localities | Compare localities |
| GET | /api/properties/seller/my-listings | My listings |

### ML
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ml/estimate | Estimate price |
| GET | /api/ml/health | ML API health |

### Areas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/areas | All area ratings |
| GET | /api/areas/:city/:locality | Single area |
| POST | /api/areas/:city/:locality/rate | Submit rating |

### Investment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/investment/insights | Top investment localities |
| GET | /api/investment/stats | Market statistics |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Recharts, react-hot-toast, react-icons |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, express-validator |
| Database | MongoDB |
| ML | Python, Flask, scikit-learn (Random Forest), pandas, numpy |
| Styling | Pure CSS (CSS variables, no UI library) |

---

## 🔧 Environment Variables

### backend/.env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zameen
JWT_SECRET=your_super_secret_key_here
ML_API_URL=http://localhost:8000
NODE_ENV=development
```

### frontend (optional .env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📦 Deployment

- **Frontend**: Vercel / Netlify (`npm run build`)
- **Backend**: Railway / Render / Heroku
- **ML API**: Railway / Render (`gunicorn app:app`)
- **Database**: MongoDB Atlas (free tier)

---

## 🇮🇳 Made for India

Zameen covers real Indian cities, uses ₹ pricing in Lakhs/Crores, and is built to work across all major metros and tier-2 cities.
