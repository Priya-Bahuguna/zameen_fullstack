import { useState, useEffect } from 'react';
import api from './api';

// Returns all localities that exist in DB (from seeded + user-listed properties)
export default function useAllLocalities(city = '') {
  const [localities, setLocalities] = useState([]);

  useEffect(() => {
    if (city) {
      // Get localities for specific city
      api.get(`/properties/localities/${city}`)
        .then(r => setLocalities(r.data || []))
        .catch(() => setLocalities([]));
    } else {
      // Get all localities across all cities
      api.get('/areas/all-localities')
        .then(r => setLocalities(r.data || []))
        .catch(() => setLocalities([]));
    }
  }, [city]);

  return localities;
}
