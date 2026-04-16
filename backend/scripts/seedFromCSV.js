require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');
const AreaRating = require('../models/AreaRating');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zameen';

// ─── DATA DEFINITIONS ───────────────────────────────────────────────
const CITIES_DATA = {
  Bangalore: {
    localities: ['Koramangala','Indiranagar','Whitefield','Electronic City','HSR Layout','Jayanagar','JP Nagar','Marathahalli','Sarjapur','Bellandur','Bannerghatta Road','Hebbal','Yelahanka','Rajajinagar','Malleshwaram'],
    basePriceBuy: 6500, baseRent: 25000,
    multipliers: { Koramangala:1.4, Indiranagar:1.35, 'HSR Layout':1.2, Whitefield:1.1, 'Electronic City':0.9, Jayanagar:1.3, 'JP Nagar':1.1, Marathahalli:1.0, Sarjapur:1.0, Bellandur:1.1, 'Bannerghatta Road':0.95, Hebbal:1.15, Yelahanka:0.85, Rajajinagar:1.25, Malleshwaram:1.3 },
    areaRatings: { Koramangala:{connectivity:4.5,safety:4.2,schools:4.3,hospitals:4.0,markets:4.8,greenery:3.5,nightlife:4.7,publicTransport:4.0}, Indiranagar:{connectivity:4.7,safety:4.3,schools:4.1,hospitals:4.2,markets:4.9,greenery:3.8,nightlife:4.9,publicTransport:4.5} }
  },
  Mumbai: {
    localities: ['Bandra West','Andheri West','Powai','Worli','Lower Parel','Goregaon','Malad','Borivali','Thane','Navi Mumbai','Juhu','Versova','Kandivali','Dahisar','Mira Road'],
    basePriceBuy: 18000, baseRent: 45000,
    multipliers: { 'Bandra West':2.0, Worli:1.9, 'Lower Parel':1.7, Juhu:1.8, 'Andheri West':1.3, Powai:1.2, Goregaon:1.0, Malad:0.95, Versova:1.1, Borivali:0.85, Thane:0.7, 'Navi Mumbai':0.65, Kandivali:0.9, Dahisar:0.75, 'Mira Road':0.6 },
    areaRatings: {}
  },
  Gurgaon: {
    localities: ['DLF Phase 1','DLF Phase 2','Sector 29','Golf Course Road','Sohna Road','MG Road','Sector 56','Palam Vihar','Sector 14','Udyog Vihar','Cyber City','Nirvana Country','South City','Vatika City','Manesar'],
    basePriceBuy: 9000, baseRent: 30000,
    multipliers: { 'Golf Course Road':1.6, 'DLF Phase 1':1.5, 'DLF Phase 2':1.45, 'Cyber City':1.3, 'MG Road':1.2, 'Sector 29':1.1, 'Sohna Road':0.9, 'Sector 56':1.0, 'Nirvana Country':1.1, 'Palam Vihar':0.85, 'Sector 14':1.05, 'Udyog Vihar':1.0, 'South City':0.95, 'Vatika City':1.05, Manesar:0.7 },
    areaRatings: {}
  },
  Hyderabad: {
    localities: ['Banjara Hills','Jubilee Hills','Hitech City','Gachibowli','Kondapur','Madhapur','Kukatpally','Miyapur','Begumpet','Secunderabad','Ameerpet','LB Nagar','Dilsukhnagar','Uppal','Kompally'],
    basePriceBuy: 5500, baseRent: 20000,
    multipliers: { 'Banjara Hills':1.7, 'Jubilee Hills':1.65, 'Hitech City':1.3, Gachibowli:1.25, Kondapur:1.2, Madhapur:1.2, Kukatpally:1.0, Miyapur:0.9, Begumpet:1.15, Secunderabad:1.0, Ameerpet:1.05, 'LB Nagar':0.85, Dilsukhnagar:0.8, Uppal:0.85, Kompally:0.9 },
    areaRatings: {}
  },
  Pune: {
    localities: ['Koregaon Park','Baner','Hinjewadi','Kharadi','Viman Nagar','Magarpatta','Hadapsar','Wakad','Pimple Saudagar','Aundh','Shivajinagar','Camp','Kothrud','Sinhagad Road','Bhosari'],
    basePriceBuy: 6000, baseRent: 22000,
    multipliers: { 'Koregaon Park':1.5, Baner:1.2, Hinjewadi:1.1, Kharadi:1.15, 'Viman Nagar':1.2, Magarpatta:1.15, Hadapsar:1.0, Wakad:1.05, 'Pimple Saudagar':0.95, Aundh:1.1, Shivajinagar:1.25, Camp:1.2, Kothrud:1.05, 'Sinhagad Road':0.85, Bhosari:0.8 },
    areaRatings: {}
  },
  Delhi: {
    localities: ['South Extension','Vasant Kunj','Dwarka','Rohini','Pitampura','Lajpat Nagar','Greater Kailash','Defence Colony','Saket','Janakpuri','Paschim Vihar','Mayur Vihar','Preet Vihar','Shahdara','Uttam Nagar'],
    basePriceBuy: 12000, baseRent: 35000,
    multipliers: { 'Defence Colony':1.8, 'Greater Kailash':1.7, 'South Extension':1.6, 'Vasant Kunj':1.4, Saket:1.35, 'Lajpat Nagar':1.3, Dwarka:0.95, Pitampura:1.0, Rohini:0.9, Janakpuri:1.0, 'Paschim Vihar':0.95, 'Mayur Vihar':1.05, 'Preet Vihar':1.0, Shahdara:0.85, 'Uttam Nagar':0.8 },
    areaRatings: {}
  },
  Chennai: {
    localities: ['T Nagar','Anna Nagar','Adyar','Velachery','Porur','Guindy','Tambaram','Perambur','Chromepet','Sholinganallur','Mylapore','Nungambakkam','Kodambakkam','Vadapalani','Ambattur'],
    basePriceBuy: 7000, baseRent: 20000,
    multipliers: { Adyar:1.5, Nungambakkam:1.4, Mylapore:1.35, 'T Nagar':1.3, 'Anna Nagar':1.25, Guindy:1.1, Velachery:1.05, Sholinganallur:1.1, Porur:1.0, Kodambakkam:1.15, Vadapalani:1.1, Tambaram:0.85, Perambur:0.9, Chromepet:0.85, Ambattur:0.8 },
    areaRatings: {}
  },
  Kolkata: {
    localities: ['Park Street','Salt Lake','New Town','Alipore','Ballygunge','Behala','Howrah','Dum Dum','Jadavpur','Tollygunge','Gariahat','Rajarhat','Kasba','Garia','Barasat'],
    basePriceBuy: 5000, baseRent: 15000,
    multipliers: { Alipore:1.8, 'Park Street':1.6, Ballygunge:1.5, 'Salt Lake':1.3, Gariahat:1.3, 'New Town':1.1, Jadavpur:1.1, Rajarhat:0.95, Tollygunge:1.0, Kasba:1.05, Howrah:0.85, Behala:0.9, 'Dum Dum':0.9, Garia:0.85, Barasat:0.7 },
    areaRatings: {}
  },
  Ahmedabad: {
    localities: ['Satellite','Prahlad Nagar','Bodakdev','Maninagar','Navrangpura','Vastrapur','Chandkheda','Bopal','Thaltej','SG Highway','Memnagar','Gota','Naroda','Odhav','Vatva'],
    basePriceBuy: 4500, baseRent: 14000,
    multipliers: { Satellite:1.4, 'Prahlad Nagar':1.35, Bodakdev:1.3, Vastrapur:1.25, Navrangpura:1.2, 'SG Highway':1.15, Thaltej:1.1, Bopal:1.0, Chandkheda:0.9, Memnagar:1.05, Gota:0.85, Naroda:0.8, Odhav:0.75, Vatva:0.7, Maninagar:0.95 },
    areaRatings: {}
  },
  Jaipur: {
    localities: ['Vaishali Nagar','Malviya Nagar','C Scheme','Mansarovar','Tonk Road','Ajmer Road','Sikar Road','Nirman Nagar','Sanganer','Jagatpura','Shyam Nagar','Adarsh Nagar','Raja Park','Civil Lines','Bani Park'],
    basePriceBuy: 4000, baseRent: 12000,
    multipliers: { 'C Scheme':1.5, 'Civil Lines':1.4, 'Bani Park':1.3, 'Vaishali Nagar':1.2, 'Malviya Nagar':1.15, Mansarovar:1.0, 'Tonk Road':1.05, 'Ajmer Road':0.9, 'Nirman Nagar':1.0, 'Raja Park':1.1, 'Adarsh Nagar':0.95, 'Shyam Nagar':0.9, 'Sikar Road':0.85, Sanganer:0.8, Jagatpura:0.85 },
    areaRatings: {}
  },
};

const PROPERTY_TYPES = ['Apartment','Villa','Independent House','Builder Floor','Studio'];
const FURNISHED = ['Furnished','Semi-Furnished','Unfurnished'];
const FACING = ['East','West','North','South','North-East','North-West','South-East','South-West'];
const AMENITIES = ['Swimming Pool','Gym','Parking','Security','Lift','Club House','Garden','Power Backup','Gas Pipeline','Internet','CCTV','Children Play Area','Jogging Track','Tennis Court','Badminton Court'];
const SELLERS = [
  { name:'Rahul Sharma', phone:'+91-9876543210', email:'rahul@example.com' },
  { name:'Priya Singh', phone:'+91-9765432109', email:'priya@example.com' },
  { name:'Amit Patel', phone:'+91-9654321098', email:'amit@example.com' },
  { name:'Sunita Verma', phone:'+91-9543210987', email:'sunita@example.com' },
  { name:'Rajesh Kumar', phone:'+91-9432109876', email:'rajesh@example.com' },
];

const IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400',
];

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); }

// ─── GENERATE PROPERTIES ────────────────────────────────────────────
function generateProperties() {
  const records = [];
  for (const [city, data] of Object.entries(CITIES_DATA)) {
    const count = rnd(80, 150);
    for (let i = 0; i < count; i++) {
      const locality = pick(data.localities);
      const mult = data.multipliers[locality] || 1.0;
      const bhk = pick([1,1,2,2,2,3,3,3,4,4,5]);
      const area = rnd(400 + bhk * 150, 800 + bhk * 350);
      const listingType = Math.random() < 0.65 ? 'Buy' : 'Rent';
      const age = rnd(0, 25);
      const floor = rnd(0, 20);
      const totalFloors = Math.max(floor, rnd(floor, floor + 15));
      const furn = pick(FURNISHED);
      const furnMult = { Furnished:1.15, 'Semi-Furnished':1.05, Unfurnished:1.0 }[furn];
      const ageMult = Math.max(0.7, 1 - age * 0.012);
      const floorMult = 1 + (floor / Math.max(totalFloors, 1)) * 0.08;
      const noise = 0.92 + Math.random() * 0.16;
      const seller = pick(SELLERS);
      const verified = Math.random() < 0.6;
      const hot = Math.random() < 0.2;
      const featured = Math.random() < 0.1;
      const propType = pick(PROPERTY_TYPES);
      const amenitiesCount = rnd(3, 9);

      let price;
      if (listingType === 'Buy') {
        price = Math.round(data.basePriceBuy * mult * area * furnMult * ageMult * floorMult * noise);
      } else {
        price = Math.round(data.baseRent * mult * bhk * 0.55 * furnMult * noise);
      }

      // Generate past 12 months price history
      const priceHistory = [];
      let p = price * 0.88;
      for (let m = 12; m >= 0; m--) {
        const d = new Date();
        d.setMonth(d.getMonth() - m);
        const change = (Math.random() - 0.4) * 3;
        p = p * (1 + change / 100);
        priceHistory.push({ price: Math.round(m === 0 ? price : p), date: d, changePercent: change });
      }

      records.push({
        title: `${bhk === 1 ? 'Cozy' : bhk >= 4 ? 'Luxurious' : 'Spacious'} ${bhk}BHK ${propType} in ${locality}`,
        description: `Beautiful ${bhk}BHK ${propType.toLowerCase()} in the heart of ${locality}, ${city}. ${furn} property with modern amenities. Perfect for ${listingType === 'Rent' ? 'families and working professionals' : 'investment and end-use'}.`,
        city, locality,
        address: `${rnd(1, 999)}, ${locality}, ${city}`,
        bhk, areaSqft: area, floor, totalFloors, ageYears: age,
        furnishedStatus: furn, facing: pick(FACING),
        propertyType: propType, listingType, price,
        amenities: pickN(AMENITIES, amenitiesCount),
        images: [pick(IMAGES), pick(IMAGES)],
        verified, hot, featured,
        sellerName: seller.name, sellerPhone: seller.phone,
        priceHistory, views: rnd(10, 500), inquiries: rnd(0, 50),
        status: 'active',
      });
    }
  }
  return records;
}

// ─── GENERATE AREA RATINGS ───────────────────────────────────────────
function generateAreaRatings() {
  const records = [];
  for (const [city, data] of Object.entries(CITIES_DATA)) {
    for (const locality of data.localities) {
      const mult = data.multipliers[locality] || 1.0;
      const base = 2.5 + mult * 1.2;
      const clamp = (v) => Math.min(5, Math.max(1, v));
      const r = (b) => Math.round(clamp(b + (Math.random() - 0.5)) * 10) / 10;
      const ratings = {
        connectivity: r(base), safety: r(base - 0.2), schools: r(base - 0.3),
        hospitals: r(base - 0.1), markets: r(base + 0.1), greenery: r(3.0),
        nightlife: r(base - 0.5), publicTransport: r(base),
      };
      const overall = Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / 8 * 10) / 10;
      const investmentScore = Math.round((mult * 40 + Math.random() * 20 + overall * 8) * 10) / 10;
      const avgPriceBuy = Math.round(data.basePriceBuy * mult * 1000);
      const avgPriceRent = Math.round(data.baseRent * mult);
      const priceGrowth1Y = Math.round((mult * 8 + Math.random() * 5 - 2) * 10) / 10;

      records.push({
        city, locality, overallRating: overall, ratings,
        avgPriceBuy, avgPriceRent, priceGrowth1Y, investmentScore: Math.min(100, investmentScore),
        description: `${locality} is a ${overall >= 4 ? 'premium' : overall >= 3 ? 'well-established' : 'developing'} locality in ${city}.`,
        pros: overall >= 4 ? ['Good connectivity', 'Safe neighbourhood', 'Good schools nearby'] : ['Affordable', 'Developing infrastructure'],
        cons: overall >= 4 ? ['High property prices', 'Traffic congestion'] : ['Limited amenities', 'Developing area'],
        userRatings: [],
      });
    }
  }
  return records;
}

// ─── WRITE CSV ───────────────────────────────────────────────────────
function writeCSV(properties) {
  const csvPath = path.join(__dirname, 'zameen_property_data.csv');
  const headers = ['title','city','locality','bhk','areaSqft','floor','totalFloors','ageYears','furnishedStatus','facing','propertyType','listingType','price','verified','hot','sellerName','sellerPhone'];
  const rows = properties.map(p => headers.map(h => `"${String(p[h] || '').replace(/"/g, '""')}"`).join(','));
  fs.writeFileSync(csvPath, [headers.join(','), ...rows].join('\n'));
  console.log(`✅ CSV written: ${csvPath} (${properties.length} rows)`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting Zameen seed...');
  
  const properties = generateProperties();
  const areaRatings = generateAreaRatings();
  writeCSV(properties);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing
    await Promise.all([Property.deleteMany({}), AreaRating.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const existingAdmin = await User.findOne({ email: 'admin@zameen.com' });
    if (!existingAdmin) {
      await User.create([
        { name: 'Admin User', email: 'admin@zameen.com', password: 'admin123', role: 'admin' },
        { name: 'Demo Seller', email: 'seller@zameen.com', password: 'seller123', role: 'seller' },
        { name: 'Demo Buyer', email: 'buyer@zameen.com', password: 'buyer123', role: 'buyer' },
      ]);
      console.log('✅ Demo users created (admin@zameen.com / admin123)');
    }

    // Insert data in batches
    const BATCH = 200;
    for (let i = 0; i < properties.length; i += BATCH) {
      await Property.insertMany(properties.slice(i, i + BATCH));
    }
    console.log(`✅ ${properties.length} properties inserted`);

    await AreaRating.insertMany(areaRatings);
    console.log(`✅ ${areaRatings.length} area ratings inserted`);

    console.log('\n🎉 Seed complete!');
    console.log('Demo accounts: admin@zameen.com/admin123 | seller@zameen.com/seller123 | buyer@zameen.com/buyer123');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    console.log('📄 CSV generated successfully without DB seed.');
    process.exit(0);
  }
}

seed();
