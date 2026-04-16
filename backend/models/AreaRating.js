const mongoose = require('mongoose');

const areaRatingSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    locality: { type: String, required: true },
    overallRating: { type: Number, default: 0, min: 0, max: 5 },
    ratings: {
      connectivity: { type: Number, default: 0 },
      safety: { type: Number, default: 0 },
      schools: { type: Number, default: 0 },
      hospitals: { type: Number, default: 0 },
      markets: { type: Number, default: 0 },
      greenery: { type: Number, default: 0 },
      nightlife: { type: Number, default: 0 },
      publicTransport: { type: Number, default: 0 },
    },
    userRatings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    avgPriceBuy: { type: Number, default: 0 },
    avgPriceRent: { type: Number, default: 0 },
    priceGrowth1Y: { type: Number, default: 0 },
    investmentScore: { type: Number, default: 0 },
    description: { type: String, default: '' },
    pros: [String],
    cons: [String],
  },
  { timestamps: true }
);

areaRatingSchema.index({ city: 1, locality: 1 }, { unique: true });

module.exports = mongoose.model('AreaRating', areaRatingSchema);
