import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { CITIES, formatPrice } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RATING_LABELS = {
  connectivity: 'Connectivity',
  safety: 'Safety',
  schools: 'Schools',
  hospitals: 'Hospitals',
  markets: 'Markets',
  greenery: 'Greenery',
  nightlife: 'Nightlife',
  publicTransport: 'Public Transport',
};

const RADAR_EXPLAIN = {
  connectivity: 'Road & highway access, proximity to main roads',
  safety: 'Crime rate, street lighting, general security',
  schools: 'Nearby schools, colleges, coaching institutes',
  hospitals: 'Hospitals, clinics, medical facilities',
  markets: 'Malls, local markets, grocery & daily needs',
  greenery: 'Parks, gardens, open spaces & air quality',
  nightlife: 'Restaurants, cafes, entertainment & social scene',
  publicTransport: 'Bus, metro, auto, cab availability',
};

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value) ? '#f59e0b' : 'var(--gray-200)', fontSize: 16 }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: 'var(--gray-500)', marginLeft: 4 }}>{value?.toFixed ? value.toFixed(1) : '0.0'}</span>
    </div>
  );
}

export default function AreaRatings() {
  const { user } = useAuth();
  const [city, setCity] = useState('Bangalore');
  const [areas, setAreas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Free-text locality search
  const [localitySearch, setLocalitySearch] = useState('');
  const [allLocalities, setAllLocalities] = useState([]);
  const [showRadarExplain, setShowRadarExplain] = useState(false);

  // Load city areas
  useEffect(() => {
    setLoading(true);
    api.get('/areas', { params: { city } })
      .then(r => { setAreas(r.data); setSelected(r.data[0] || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  // Load all localities from DB (including seller-listed ones)
  useEffect(() => {
    api.get('/areas/all-localities').then(r => setAllLocalities(r.data || [])).catch(() => {});
    // Also from properties
    api.get('/properties/cities').then(r => {}).catch(() => {});
  }, []);

  // Search for any locality and load it
  const handleSearchLocality = async () => {
    if (!localitySearch.trim()) return;
    try {
      const res = await api.get(`/areas/${city}/${localitySearch.trim()}`);
      setSelected(res.data);
      if (!areas.find(a => a._id === res.data._id)) {
        setAreas(prev => [res.data, ...prev]);
      }
    } catch {
      // Area not in DB yet — show empty entry so user can rate it
      setSelected({
        _id: 'new_' + localitySearch,
        city,
        locality: localitySearch.trim(),
        overallRating: 0,
        ratings: { connectivity: 0, safety: 0, schools: 0, hospitals: 0, markets: 0, greenery: 0, nightlife: 0, publicTransport: 0 },
        investmentScore: null,
        avgPriceBuy: null,
        avgPriceRent: null,
        priceGrowth1Y: null,
        description: `${localitySearch.trim()} — community ratings coming soon. Be the first to rate!`,
        pros: [],
        cons: [],
        userRatings: [],
        isNew: true,
      });
      toast('Area not in database yet — you can be the first to rate it! 🌟', { icon: '📍' });
    }
  };

  const handleRate = async () => {
    if (!user) { toast.error('Please login to rate'); return; }
    if (!rating) { toast.error('Select a rating (1–5 stars)'); return; }
    setSubmitting(true);
    try {
      const targetLocality = selected?.isNew ? localitySearch.trim() : selected.locality;
      const targetCity = selected?.city || city;
      const res = await api.post(`/areas/${targetCity}/${targetLocality}/rate`, { rating, review });
      setSelected(res.data);
      setAreas(prev => {
        const exists = prev.find(a => a._id === res.data._id);
        return exists ? prev.map(a => a._id === res.data._id ? res.data : a) : [res.data, ...prev];
      });
      toast.success('Rating submitted! Thank you 🎉');
      setRating(0); setReview('');
    } catch { toast.error('Failed to submit rating'); }
    finally { setSubmitting(false); }
  };

  const radarData = selected ? Object.entries(RATING_LABELS).map(([key, label]) => ({
    label,
    value: selected.ratings?.[key] || 0,
    explain: RADAR_EXPLAIN[key],
  })) : [];

  const selStyle = { padding: '10px 14px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'white' };

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>⭐ Area Ratings</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Community ratings for every locality across India — search any area and rate it</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input list="ar-city-list" style={selStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="City..." />
        <datalist id="ar-city-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>

        {/* Free search any locality */}
        <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              list="ar-locality-list"
              style={{ ...selStyle, width: '100%' }}
              placeholder="Search any locality — Chaukhat, Adyar, Sector 21..."
              value={localitySearch}
              onChange={e => setLocalitySearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchLocality()}
            />
            <datalist id="ar-locality-list">
              {allLocalities.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
          <button className="btn btn-primary" onClick={handleSearchLocality} style={{ whiteSpace: 'nowrap' }}>
            🔍 Search
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.5px', marginBottom: 4 }}>
            {areas.length} AREAS IN {city.toUpperCase()}
          </div>
          {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />) :
            areas.map(area => (
              <button key={area._id} onClick={() => setSelected(area)}
                style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 12, border: '2px solid', borderColor: selected?._id === area._id ? 'var(--green-700)' : 'var(--gray-200)', background: selected?._id === area._id ? 'var(--green-50)' : 'white', cursor: 'pointer', transition: 'var(--transition)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{area.locality}</div>
                <Stars value={area.overallRating} />
              </button>
            ))
          }
        </div>

        {/* Detail */}
        {selected && (
          <div className="animate-fade">
            <div className="card" style={{ padding: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{selected.locality}</h2>
                  <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 8 }}>{selected.city}</p>
                  <Stars value={selected.overallRating} />
                  {selected.isNew && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef9c3', border: '1.5px solid #f59e0b', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                      📍 New area — no data yet. Rate it below to get it started!
                    </div>
                  )}
                  {!selected.isNew && <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 8 }}>{selected.description}</p>}
                </div>
                {!selected.isNew && selected.investmentScore != null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Investment Score</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{selected.investmentScore?.toFixed(0)}/100</div>
                  </div>
                )}
              </div>

              {!selected.isNew && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Ratings bars */}
                  <div>
                    {Object.entries(RATING_LABELS).map(([key, label]) => (
                      <div key={key} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.ratings?.[key]?.toFixed(1) || '—'}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${((selected.ratings?.[key] || 0) / 5) * 100}%`, background: 'var(--green-500)', borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Radar chart */}
                  <div>
                    {/* What does Radar mean? */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>📡 Area Quality Radar</span>
                      <button onClick={() => setShowRadarExplain(!showRadarExplain)}
                        style={{ fontSize: 12, color: 'var(--green-700)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {showRadarExplain ? 'Hide' : 'What is this? ℹ️'}
                      </button>
                    </div>

                    {showRadarExplain && (
                      <div style={{ background: 'var(--green-50)', border: '1.5px solid var(--green-200)', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: 'var(--green-800)', marginBottom: 6 }}>How to read this chart:</div>
                        <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 8 }}>
                          Each axis = one aspect of the area (out of 5). A <strong>larger, more filled shape</strong> means the area scores well across all parameters. A shape biased toward one side means that area excels in that specific aspect.
                        </p>
                        {Object.entries(RADAR_EXPLAIN).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 4, color: 'var(--gray-700)' }}>
                            <strong>{RATING_LABELS[k]}:</strong> {v}
                          </div>
                        ))}
                      </div>
                    )}

                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--gray-200)" />
                        <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <Radar name="Rating" dataKey="value" stroke="var(--green-700)" fill="var(--green-700)" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {!selected.isNew && (selected.avgPriceBuy || selected.avgPriceRent) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
                  {[
                    { label: 'Avg Buy Price', val: selected.avgPriceBuy ? formatPrice(selected.avgPriceBuy, 'Buy') : '—' },
                    { label: 'Avg Rent/mo', val: selected.avgPriceRent ? formatPrice(selected.avgPriceRent, 'Rent') : '—' },
                    { label: '1Y Growth', val: selected.priceGrowth1Y != null ? `${selected.priceGrowth1Y > 0 ? '+' : ''}${selected.priceGrowth1Y?.toFixed(1)}%` : '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', background: 'var(--gray-50)', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rate it */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>⭐ Rate {selected.locality}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
                {selected.userRatings?.length > 0 ? `${selected.userRatings.length} people have rated this area` : 'Be the first to rate this area!'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)}
                    style={{ fontSize: 36, background: 'none', border: 'none', cursor: 'pointer', color: i <= rating ? '#f59e0b' : 'var(--gray-200)', transition: 'var(--transition)' }}>★</button>
                ))}
                {rating > 0 && <span style={{ alignSelf: 'center', fontSize: 14, color: 'var(--gray-600)' }}>{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
              </div>
              <textarea
                placeholder="Share your experience — traffic, infrastructure, neighbors, daily life..."
                value={review} onChange={e => setReview(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, minHeight: 80, resize: 'vertical', outline: 'none', fontFamily: 'inherit', marginBottom: 12 }}
              />
              <button className="btn btn-primary" onClick={handleRate} disabled={submitting || !rating}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              {!user && <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>Please <a href="/login" style={{ color: 'var(--green-700)' }}>login</a> to rate areas</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
