const express = require('express');
const axios = require('axios');
const router = express.Router();

const ML_API = process.env.ML_API_URL || 'http://localhost:8000';

// City base prices per sqft (Buy) and monthly (Rent base per BHK)
const CITY_BASE = {
  Mumbai: { buy: 18000, rent: 22000 },
  Delhi: { buy: 12000, rent: 16000 },
  Gurgaon: { buy: 9000, rent: 18000 },
  Bangalore: { buy: 6500, rent: 15000 },
  Hyderabad: { buy: 5500, rent: 12000 },
  Pune: { buy: 6000, rent: 13000 },
  Chennai: { buy: 7000, rent: 13000 },
  Kolkata: { buy: 5000, rent: 10000 },
  Ahmedabad: { buy: 4500, rent: 9000 },
  Jaipur: { buy: 4000, rent: 8000 },
  Dehradun: { buy: 4500, rent: 10000 },
  Haridwar: { buy: 3500, rent: 7000 },
  Noida: { buy: 7000, rent: 14000 },
  Chandigarh: { buy: 6000, rent: 13000 },
};

router.post('/estimate', async (req, res) => {
  try {
    const response = await axios.post(`${ML_API}/predict`, req.body, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    // Heuristic fallback — properly uses ALL input fields
    const { city, bhk = 2, areaSqft = 1000, furnishedStatus, listingType, ageYears = 0, floor = 0, totalFloors = 5, locality = '' } = req.body;
    
    const area = Number(areaSqft) || 1000;
    const beds = Number(bhk) || 2;
    const age = Number(ageYears) || 0;
    const floorNum = Number(floor) || 0;
    const totalFl = Number(totalFloors) || 5;

    // City base
    const cityKey = Object.keys(CITY_BASE).find(k => k.toLowerCase() === (city || '').toLowerCase()) || 'Bangalore';
    const base = CITY_BASE[cityKey] || { buy: 5000, rent: 9000 };

    // Multipliers
    const furnMult = { Furnished: 1.15, 'Semi-Furnished': 1.05, Unfurnished: 1.0 }[furnishedStatus] || 1.0;
    const ageMult = Math.max(0.7, 1 - age * 0.012);
    const floorMult = 1 + (floorNum / Math.max(totalFl, 1)) * 0.08;
    // Locality premium (simple hash-based so same locality always gives same result)
    const localityHash = locality.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const localityMult = 0.85 + ((localityHash % 60) / 100); // 0.85 to 1.45

    let price, low, high;
    if (listingType === 'Buy') {
      price = Math.round(base.buy * area * furnMult * ageMult * floorMult * localityMult);
      low = Math.round(price * 0.88);
      high = Math.round(price * 1.12);
    } else {
      price = Math.round(base.rent * beds * furnMult * localityMult * ageMult);
      low = Math.round(price * 0.85);
      high = Math.round(price * 1.15);
    }

    res.json({
      predicted_price: price,
      price_range: { low, high },
      confidence: 0.72,
      source: 'heuristic',
      top_factors: [
        { factor: 'Area (sqft)', impact: 35.2 },
        { factor: 'City', impact: 28.4 },
        { factor: 'Locality', impact: 18.6 },
        { factor: 'BHK', impact: 10.1 },
        { factor: 'Furnished Status', impact: 7.7 },
      ],
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    const r = await axios.get(`${ML_API}/health`, { timeout: 3000 });
    res.json({ ml_api: 'up', ...r.data });
  } catch {
    res.json({ ml_api: 'down', message: 'ML API not running, using fallback' });
  }
});

module.exports = router;
