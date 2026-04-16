import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import { CITIES, BHK_OPTIONS, FURNISHED_OPTIONS, PROPERTY_TYPES } from '../utils/helpers';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [localities, setLocalities] = useState([]);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    locality: '',
    listingType: '',
    bhk: '',
    minPrice: '',
    maxPrice: '',
    furnishedStatus: '',
    propertyType: '',
    verified: false,
    page: 1,
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== false));
      const res = await api.get('/properties', { params });
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  useEffect(() => {
    if (filters.city) {
      api.get(`/properties/localities/${filters.city}`).then(r => setLocalities(r.data)).catch(() => setLocalities([]));
    } else {
      setLocalities([]);
    }
  }, [filters.city]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ city: '', locality: '', listingType: '', bhk: '', minPrice: '', maxPrice: '', furnishedStatus: '', propertyType: '', verified: false, page: 1 });

  const inputStyle = { padding: '10px 12px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, width: '100%', background: 'white', outline: 'none' };

  return (
    <div style={{ display: 'flex', maxWidth: 1280, margin: '0 auto', padding: '32px 24px', gap: 28, alignItems: 'flex-start' }}>
      {/* Sidebar Filters */}
      <aside style={{ width: 250, flexShrink: 0, background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', padding: 24, position: 'sticky', top: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>☰ Filters</span>
          <button onClick={clearFilters} style={{ color: 'var(--green-700)', background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Clear All</button>
        </div>

        {[
          { label: 'LISTING TYPE', content: (
            <div style={{ display: 'flex', gap: 8 }}>
              {['Buy', 'Rent'].map(t => (
                <button key={t} onClick={() => setFilter('listingType', filters.listingType === t ? '' : t)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid', borderColor: filters.listingType === t ? 'var(--green-700)' : 'var(--gray-300)', background: filters.listingType === t ? 'var(--green-50)' : 'white', color: filters.listingType === t ? 'var(--green-700)' : 'var(--gray-700)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {t === 'Buy' ? '🏠' : '🔑'} {t}
                </button>
              ))}
            </div>
          )},
          { label: 'CITY', content: (
            <>
              <input
                list="properties-city-list"
                style={inputStyle}
                placeholder="Type or select city..."
                value={filters.city}
                onChange={e => setFilter('city', e.target.value)}
              />
              <datalist id="properties-city-list">
                {CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
              {filters.city && (
                <button onClick={() => setFilter('city', '')}
                  style={{ marginTop: 6, fontSize: 12, color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  ✕ Clear city
                </button>
              )}
            </>
          )},
          { label: 'LOCALITY', content: (
            <>
              <input
                list="properties-locality-list"
                style={inputStyle}
                placeholder="Type any locality..."
                value={filters.locality}
                onChange={e => setFilter('locality', e.target.value)}
              />
              <datalist id="properties-locality-list">
                {localities.map(l => <option key={l} value={l} />)}
              </datalist>
            </>
          )},
          { label: 'PROPERTY TYPE', content: (
            <select style={inputStyle} value={filters.propertyType} onChange={e => setFilter('propertyType', e.target.value)}>
              <option value="">Select Type</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )},
          { label: 'BHK', content: (
            <select style={inputStyle} value={filters.bhk} onChange={e => setFilter('bhk', e.target.value)}>
              <option value="">Select BHK</option>
              {BHK_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
            </select>
          )},
          { label: 'PRICE RANGE (₹)', content: (
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inputStyle, width: '50%' }} placeholder="Min" type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} />
              <input style={{ ...inputStyle, width: '50%' }} placeholder="Max" type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
            </div>
          )},
          { label: 'FURNISHED STATUS', content: (
            <select style={inputStyle} value={filters.furnishedStatus} onChange={e => setFilter('furnishedStatus', e.target.value)}>
              <option value="">Select status</option>
              {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )},
        ].filter(Boolean).map(({ label, content }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</div>
            {content}
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={filters.verified} onChange={e => setFilter('verified', e.target.checked)} />
          Verified listings only
        </label>

        <button className="btn btn-primary" onClick={fetchProperties} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          ☰ Apply Filters
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Browse Properties</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>
            {loading ? 'Loading...' : `${total.toLocaleString('en-IN')} properties found`}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 18 }}>
                  <div className="skeleton" style={{ height: 20, marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <h3>No properties found</h3>
            <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                    style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid', borderColor: filters.page === p ? 'var(--green-700)' : 'var(--gray-300)', background: filters.page === p ? 'var(--green-700)' : 'white', color: filters.page === p ? 'white' : 'var(--gray-700)', fontWeight: 600, cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
