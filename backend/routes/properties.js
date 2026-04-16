const express = require('express');
const Property = require('../models/Property');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET all properties with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      city, locality, listingType, bhk, minPrice, maxPrice,
      furnishedStatus, propertyType, verified, page = 1, limit = 12, sort = '-createdAt'
    } = req.query;

    const filter = { status: 'active' };
    if (city) filter.city = new RegExp(city, 'i');
    if (locality) filter.locality = new RegExp(locality, 'i');
    if (listingType) filter.listingType = listingType;
    if (bhk) filter.bhk = Number(bhk);
    if (furnishedStatus) filter.furnishedStatus = furnishedStatus;
    if (propertyType) filter.propertyType = propertyType;
    if (verified === 'true') filter.verified = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(Number(limit)).populate('seller', 'name phone email'),
      Property.countDocuments(filter),
    ]);

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET featured properties
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'active', featured: true }).limit(6);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET cities list
router.get('/cities', async (req, res) => {
  try {
    const cities = await Property.distinct('city');
    res.json(cities.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET localities by city
router.get('/localities/:city', async (req, res) => {
  try {
    const localities = await Property.distinct('locality', { city: new RegExp(req.params.city, 'i') });
    res.json(localities.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET price history for a locality
router.get('/price-history/:city/:locality', async (req, res) => {
  try {
    const { city, locality } = req.params;
    const { listingType = 'Buy' } = req.query;
    const properties = await Property.find({
      city: new RegExp(city, 'i'),
      locality: new RegExp(locality, 'i'),
      listingType,
      status: 'active',
    }).select('price priceHistory createdAt');

    // Build monthly price history
    const monthMap = {};
    properties.forEach((p) => {
      const month = new Date(p.createdAt).toISOString().slice(0, 7);
      if (!monthMap[month]) monthMap[month] = [];
      monthMap[month].push(p.price / p.areaSqft || p.price);
    });

    const history = Object.entries(monthMap)
      .sort()
      .map(([month, prices]) => ({
        month,
        avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        count: prices.length,
      }));

    res.json({ city, locality, listingType, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single property
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'name phone email avatar');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.views += 1;
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create listing (seller)
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, seller: req.user._id, sellerName: req.user.name, sellerPhone: req.user.phone };
    data.priceHistory = [{ price: data.price, date: new Date(), changePercent: 0 }];
    const property = await Property.create(data);
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update listing
router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Not found' });
    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // Track price change
    if (req.body.price && req.body.price !== property.price) {
      const change = ((req.body.price - property.price) / property.price) * 100;
      property.priceHistory.push({ price: req.body.price, date: new Date(), changePercent: change });
    }
    Object.assign(property, req.body);
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Not found' });
    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my listings
router.get('/seller/my-listings', protect, async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id }).sort('-createdAt');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET compare localities
router.get('/compare/localities', async (req, res) => {
  try {
    const { localities, city } = req.query;
    if (!localities) return res.status(400).json({ message: 'localities param required' });
    const localityList = localities.split(',').map((l) => l.trim());

    const results = await Promise.all(
      localityList.map(async (locality) => {
        const filter = { locality: new RegExp(locality, 'i'), status: 'active' };
        if (city) filter.city = new RegExp(city, 'i');
        const props = await Property.find(filter);
        const buyProps = props.filter((p) => p.listingType === 'Buy');
        const rentProps = props.filter((p) => p.listingType === 'Rent');
        const avgBuy = buyProps.length ? Math.round(buyProps.reduce((s, p) => s + p.price, 0) / buyProps.length) : 0;
        const avgRent = rentProps.length ? Math.round(rentProps.reduce((s, p) => s + p.price, 0) / rentProps.length) : 0;
        return { locality, totalListings: props.length, avgBuyPrice: avgBuy, avgRentPrice: avgRent, properties: props.slice(0, 3) };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all distinct localities from properties (for dynamic dropdowns)
router.get('/all-localities', async (req, res) => {
  try {
    const localities = await Property.distinct('locality');
    res.json(localities.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
