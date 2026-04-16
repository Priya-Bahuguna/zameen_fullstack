const express = require('express');
const AreaRating = require('../models/AreaRating');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET all area ratings
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city: new RegExp(city, 'i') } : {};
    const areas = await AreaRating.find(filter).sort('-overallRating');
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all distinct localities
router.get('/all-localities', async (req, res) => {
  try {
    const localities = await AreaRating.distinct('locality');
    res.json(localities.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single area
router.get('/:city/:locality', async (req, res) => {
  try {
    const area = await AreaRating.findOne({
      city: new RegExp(req.params.city, 'i'),
      locality: new RegExp(req.params.locality, 'i'),
    }).populate('userRatings.user', 'name avatar');
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST rate an area - creates new if doesn't exist, updates all individual ratings
router.post('/:city/:locality/rate', protect, async (req, res) => {
  try {
    const { rating, review, individualRatings } = req.body;
    const cityParam = req.params.city;
    const localityParam = req.params.locality;

    let area = await AreaRating.findOne({
      city: new RegExp(cityParam, 'i'),
      locality: new RegExp(localityParam, 'i'),
    });

    if (!area) {
      area = await AreaRating.create({
        city: cityParam,
        locality: localityParam,
        overallRating: 0,
        ratings: {
          connectivity: rating, safety: rating, schools: rating,
          hospitals: rating, markets: rating, greenery: rating,
          nightlife: rating, publicTransport: rating,
        },
        userRatings: [],
        description: `${localityParam} is a locality in ${cityParam}.`,
        pros: ['Community rated area'],
        cons: ['Limited data available'],
        investmentScore: Math.min(100, rating * 15 + 20),
      });
    }

    // Remove old rating from this user
    area.userRatings = area.userRatings.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );
    area.userRatings.push({ user: req.user._id, rating, review });

    // Recalculate overall rating
    const avg = area.userRatings.reduce((s, r) => s + r.rating, 0) / area.userRatings.length;
    area.overallRating = Math.round(avg * 10) / 10;

    // Update individual ratings — blend existing with new user rating
    // If user provided specific ratings use those, else use overall as base for all
    const params = ['connectivity', 'safety', 'schools', 'hospitals', 'markets', 'greenery', 'nightlife', 'publicTransport'];
    const userCount = area.userRatings.length;
    
    if (individualRatings) {
      // User rated individual parameters
      params.forEach(p => {
        if (individualRatings[p]) {
          const old = area.ratings[p] || 0;
          area.ratings[p] = Math.round(((old * (userCount - 1)) + individualRatings[p]) / userCount * 10) / 10;
        }
      });
    } else {
      // Blend overall rating into all parameters proportionally
      params.forEach(p => {
        const existing = area.ratings[p] || 0;
        if (existing === 0) {
          area.ratings[p] = rating;
        } else {
          area.ratings[p] = Math.round(((existing * (userCount - 1)) + rating) / userCount * 10) / 10;
        }
      });
    }

    // Update investment score based on ratings
    area.investmentScore = Math.min(100, Math.round(area.overallRating * 15 + userCount * 2 + 20));

    area.markModified('ratings');
    await area.save();
    res.json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
