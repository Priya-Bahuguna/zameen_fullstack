const express = require('express');
const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const Property = require('../models/Property');
    const AreaRating = require('../models/AreaRating');
    const User = require('../models/User');
    const [props, areas, users] = await Promise.all([
      Property.countDocuments(), AreaRating.countDocuments(), User.countDocuments(),
    ]);
    res.json({ properties: props, areaRatings: areas, users, status: props > 50 ? 'seeded' : 'empty' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/run', async (req, res) => {
  try {
    const Property = require('../models/Property');
    const count = await Property.countDocuments();
    if (count > 50) {
      return res.json({ message: `Already seeded! ${count} properties in DB.`, status: 'already_seeded' });
    }
    res.json({ message: 'Seeding started... Visit /api/seed/status in 45 seconds.', status: 'seeding' });
    setTimeout(async () => {
      try {
        const seed = require('../scripts/seedAPI');
        const result = await seed();
        console.log('Seed complete:', result);
      } catch(e) { console.error('Seed error:', e.message); }
    }, 100);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;