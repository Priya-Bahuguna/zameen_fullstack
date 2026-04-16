export const formatPrice = (price, listingType = 'Buy') => {
  if (!price) return '—';
  if (listingType === 'Rent') {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L/mo`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K/mo`;
    return `₹${price}/mo`;
  }
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (sqft) => sqft ? `${sqft.toLocaleString('en-IN')} sqft` : '—';

export const formatAge = (years) => {
  if (!years) return 'New';
  if (years === 1) return '1 yr';
  return `${years} yrs`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatChangePercent = (val) => {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val?.toFixed(1)}%`;
};

export const getPricePerSqft = (price, area) => {
  if (!price || !area) return '—';
  return `₹${Math.round(price / area).toLocaleString('en-IN')}/sqft`;
};

// All major Indian cities — sorted alphabetically
export const CITIES = [
  'Agartala','Agra','Ahmedabad','Ajmer','Aligarh','Allahabad','Ambala','Amravati',
  'Amritsar','Asansol','Aurangabad','Bangalore','Bardhaman','Bareilly','Belgaum',
  'Bellary','Bhagalpur','Bhavnagar','Bhilai','Bhopal','Bhubaneswar','Bikaner',
  'Bilaspur','Brahmapur','Chandigarh','Chennai','Coimbatore','Cuttack','Davangere',
  'Dehradun','Delhi','Dharamsala','Dhanbad','Dibrugarh','Durg','Durgapur',
  'Erode','Faridabad','Gandhinagar','Gaya','Ghaziabad','Gurgaon','Guntur',
  'Guwahati','Gwalior','Haldwani','Haridwar','Hisar','Howrah','Hubli',
  'Hyderabad','Imphal','Indore','Jabalpur','Jaipur','Jalandhar','Jamnagar',
  'Jammu','Jamshedpur','Jodhpur','Kannur','Kanpur','Kochi','Kolhapur',
  'Kolkata','Kollam','Kota','Kozhikode','Lucknow','Ludhiana','Madurai',
  'Mangalore','Manali','Mapusa','Margao','Mathura','Meerut','Moradabad',
  'Mumbai','Muzaffarpur','Mysore','Nagpur','Nainital','Nashik','Navi Mumbai',
  'Nellore','Noida','Panaji','Panipat','Patna','Patiala','Prayagraj',
  'Pune','Raipur','Rajkot','Ranchi','Rishikesh','Rohtak','Roorkee',
  'Rourkela','Salem','Shillong','Shimla','Silchar','Siliguri','Solan',
  'Solapur','Srinagar','Surat','Thane','Thiruvananthapuram','Thrissur',
  'Tiruchirappalli','Tirunelveli','Tirupati','Udaipur','Ujjain','Vadodara',
  'Varanasi','Vasco da Gama','Vellore','Vijayawada','Visakhapatnam','Warangal',
];

export const BHK_OPTIONS = [1, 2, 3, 4, 5];
export const FURNISHED_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Builder Floor', 'Studio'];
export const FACING_OPTIONS = ['East','West','North','South','North-East','North-West','South-East','South-West'];
