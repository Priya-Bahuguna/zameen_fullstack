const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  changePercent: { type: Number, default: 0 },
});

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    city: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String, default: '' },
    bhk: { type: Number, required: true, min: 1, max: 10 },
    areaSqft: { type: Number, required: true },
    floor: { type: Number, default: 0 },
    totalFloors: { type: Number, default: 1 },
    ageYears: { type: Number, default: 0 },
    furnishedStatus: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Unfurnished',
    },
    facing: {
      type: String,
      enum: ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'],
      default: 'East',
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Villa', 'Independent House', 'Builder Floor', 'Studio'],
      default: 'Apartment',
    },
    listingType: { type: String, enum: ['Buy', 'Rent'], required: true },
    price: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    verified: { type: Boolean, default: false },
    hot: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sellerName: { type: String },
    sellerPhone: { type: String },
    priceHistory: [priceHistorySchema],
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'sold', 'rented', 'inactive'], default: 'active' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, locality: 1, listingType: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', city: 'text', locality: 'text' });

module.exports = mongoose.model('Property', propertySchema);
