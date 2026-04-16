import React, { useState, useEffect } from 'react';

// Lightweight map using OpenStreetMap iframe (no npm install needed)
// Uses Nominatim free geocoding API to convert address to coordinates

export default function PropertyMap({ property, height = 280 }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const address = [
    property?.address,
    property?.locality,
    property?.city,
    'India'
  ].filter(Boolean).join(', ');

  useEffect(() => {
    // Use pre-set coords if available
    if (property?.latitude && property?.longitude) {
      setCoords({ lat: property.latitude, lng: property.longitude });
      setLoading(false);
      return;
    }

    // Geocode using Nominatim (free OpenStreetMap geocoding)
    const query = encodeURIComponent(address);
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ZameenApp/1.0' }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [address, property?.latitude, property?.longitude]);

  if (loading) {
    return (
      <div style={{ height, background: 'var(--gray-100)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Loading map...</span>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div style={{ height, background: 'var(--gray-50)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, border: '1.5px dashed var(--gray-200)' }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Map not available for this location</span>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`}
          target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 600 }}>
          View on OpenStreetMap ↗
        </a>
      </div>
    );
  }

  // Use OpenStreetMap embed (free, no API key)
  const zoom = 15;
  const bbox = `${coords.lng - 0.01},${coords.lat - 0.01},${coords.lng + 0.01},${coords.lat + 0.01}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`;

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--gray-200)' }}>
      <iframe
        src={mapSrc}
        width="100%"
        height={height}
        style={{ border: 'none', display: 'block' }}
        title={`Map of ${property?.locality}, ${property?.city}`}
        loading="lazy"
      />
      <div style={{ padding: '10px 14px', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>
          📍 {property?.locality}, {property?.city}
        </span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=${zoom}/${coords.lat}/${coords.lng}`}
          target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 600, textDecoration: 'none' }}>
          Open in Maps ↗
        </a>
      </div>
    </div>
  );
}
