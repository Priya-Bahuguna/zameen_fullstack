import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CITIES, formatPrice } from '../utils/helpers';

const starBar = (val, max = 5) => {
  const pct = Math.round((val / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green-500)', borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-700)', minWidth: 24 }}>{val?.toFixed ? val.toFixed(1) : val}</span>
    </div>
  );
};

export default function Compare() {
  const [city, setCity] = useState('Bangalore');
  const [localities, setLocalities] = useState([]);
  const [allLocalities, setAllLocalities] = useState([]);
  const [selected, setSelected] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [areaData, setAreaData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city) {
      api.get(`/properties/localities/${city}`).then(r => setLocalities(r.data)).catch(() => {});
    }
  }, [city]);

  useEffect(() => {
    // Load ALL localities from DB for datalist suggestions
    api.get('/areas/all-localities').then(r => setAllLocalities(r.data || [])).catch(() => {});
  }, []);

  const handleCompare = async () => {
    const chosen = selected.filter(Boolean);
    if (chosen.length < 2) { alert('Select at least 2 localities'); return; }
    setLoading(true);
    try {
      const [propRes, ...areaRes] = await Promise.all([
        api.get('/properties/compare/localities', { params: { localities: chosen.join(','), city } }),
        ...chosen.map(l => api.get(`/areas/${city}/${l}`).catch(() => ({ data: null }))),
      ]);
      setResults(propRes.data);
      const areaMap = {};
      chosen.forEach((l, i) => { areaMap[l] = areaRes[i]?.data; });
      setAreaData(areaMap);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const setLoc = (i, val) => setSelected(prev => { const n = [...prev]; n[i] = val; return n; });

  const selStyle = { padding: '12px 14px', border: '1.5px solid var(--gray-300)', borderRadius: 12, fontSize: 14, outline: 'none', background: 'white', width: '100%' };

  // All comparison parameters
  const PARAMS = [
    { label: '🏘 Total Listings', key: 'totalListings', format: v => v || '—', best: 'max' },
    { label: '💰 Avg Buy Price', key: 'avgBuyPrice', format: v => v ? formatPrice(v, 'Buy') : '—', best: 'min' },
    { label: '🔑 Avg Rent/mo', key: 'avgRentPrice', format: v => v ? formatPrice(v, 'Rent') : '—', best: 'min' },
  ];

  const AREA_PARAMS = [
    { label: '⭐ Overall Rating', aKey: 'overallRating', max: 5 },
    { label: '📈 Price Growth (1Y)', aKey: 'priceGrowth1Y', format: v => v != null ? `${v > 0 ? '+' : ''}${v.toFixed(1)}%` : '—', best: 'max' },
    { label: '💎 Investment Score', aKey: 'investmentScore', max: 100 },
    { label: '🔗 Connectivity', aKey: 'ratings.connectivity', max: 5 },
    { label: '🛡 Safety', aKey: 'ratings.safety', max: 5 },
    { label: '🏫 Schools', aKey: 'ratings.schools', max: 5 },
    { label: '🏥 Hospitals', aKey: 'ratings.hospitals', max: 5 },
    { label: '🛒 Markets', aKey: 'ratings.markets', max: 5 },
    { label: '🌳 Greenery', aKey: 'ratings.greenery', max: 5 },
    { label: '🚌 Public Transport', aKey: 'ratings.publicTransport', max: 5 },
    { label: '🌙 Nightlife', aKey: 'ratings.nightlife', max: 5 },
  ];

  const getAreaVal = (locality, aKey) => {
    const d = areaData[locality];
    if (!d) return null;
    if (aKey.includes('.')) {
      const [obj, prop] = aKey.split('.');
      return d[obj]?.[prop] ?? null;
    }
    return d[aKey] ?? null;
  };

  const getBestLocality = (vals, best) => {
    const nums = vals.map(v => typeof v === 'number' ? v : null);
    if (nums.every(v => v === null)) return null;
    return best === 'max' ? Math.max(...nums.filter(v => v !== null)) : Math.min(...nums.filter(v => v !== null));
  };

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>🔍</span>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>Compare Localities</h1>
        </div>
        <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Compare up to 3 localities across 14 parameters — pricing, ratings, safety, investment & more</p>
      </div>

      {/* Selector */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', padding: 32, marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 8 }}>CITY</label>
          <input list="compare-city-list" style={{ ...selStyle, maxWidth: 280 }} value={city}
            onChange={e => { setCity(e.target.value); setSelected(['', '', '']); setResults([]); setAreaData({}); }}
            placeholder="Type city..." />
          <datalist id="compare-city-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 8 }}>
                LOCALITY {i + 1}{i < 2 ? ' *' : ' (Optional)'}
              </label>
              <input list={`loc-list-${i}`} style={selStyle} value={selected[i]}
                onChange={e => setLoc(i, e.target.value)}
                placeholder="Type or select locality..." />
              <datalist id={`loc-list-${i}`}>
                {[...new Set([...localities, ...allLocalities])].filter(l => !selected.includes(l) || selected[i] === l).map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={handleCompare} disabled={loading} style={{ padding: '14px 36px', fontSize: 16 }}>
          {loading ? '⏳ Comparing...' : '🔍 Compare Now'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="animate-fade">
          {/* Big comparison table */}
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--green-700)', color: 'white' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: 14, minWidth: 200 }}>Parameter</th>
                  {results.map(r => (
                    <th key={r.locality} style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, fontSize: 14, minWidth: 160 }}>
                      {r.locality}<br />
                      <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>{city}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Property params */}
                <tr style={{ background: 'var(--green-50)' }}>
                  <td colSpan={results.length + 1} style={{ padding: '10px 20px', fontSize: 11, fontWeight: 800, color: 'var(--green-700)', letterSpacing: '0.8px' }}>PROPERTY DATA</td>
                </tr>
                {PARAMS.map(({ label, key, format, best }, idx) => {
                  const vals = results.map(r => r[key]);
                  const bestVal = getBestLocality(vals, best);
                  return (
                    <tr key={key} style={{ background: idx % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: 'var(--gray-700)' }}>{label}</td>
                      {results.map(r => {
                        const isBest = best && r[key] === bestVal && bestVal !== null;
                        return (
                          <td key={r.locality} style={{ padding: '14px 20px', textAlign: 'center', fontWeight: isBest ? 800 : 500, color: isBest ? 'var(--green-700)' : 'var(--gray-700)', fontSize: 15 }}>
                            {format(r[key])}{isBest && <span style={{ fontSize: 11, marginLeft: 4, color: 'var(--green-500)' }}>✓ Best</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Area Rating params */}
                <tr style={{ background: 'var(--green-50)' }}>
                  <td colSpan={results.length + 1} style={{ padding: '10px 20px', fontSize: 11, fontWeight: 800, color: 'var(--green-700)', letterSpacing: '0.8px' }}>AREA RATINGS & INVESTMENT</td>
                </tr>
                {AREA_PARAMS.map(({ label, aKey, max, format, best }, idx) => {
                  const vals = results.map(r => getAreaVal(r.locality, aKey));
                  const bestVal = getBestLocality(vals, best || 'max');
                  return (
                    <tr key={aKey} style={{ background: idx % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: 'var(--gray-700)' }}>{label}</td>
                      {results.map(r => {
                        const val = getAreaVal(r.locality, aKey);
                        const isBest = val !== null && val === bestVal;
                        return (
                          <td key={r.locality} style={{ padding: '12px 20px', textAlign: 'center' }}>
                            {val === null ? (
                              <span style={{ color: 'var(--gray-300)', fontSize: 13 }}>—</span>
                            ) : max ? (
                              <div style={{ maxWidth: 140, margin: '0 auto' }}>
                                {starBar(val, max)}
                                {isBest && <span style={{ fontSize: 10, color: 'var(--green-600)', fontWeight: 700 }}>✓ Best</span>}
                              </div>
                            ) : (
                              <span style={{ fontWeight: isBest ? 800 : 500, color: isBest ? 'var(--green-700)' : (val > 0 ? 'var(--gray-700)' : '#ef4444'), fontSize: 15 }}>
                                {format ? format(val) : val}
                                {isBest && <span style={{ fontSize: 11, marginLeft: 4 }}>✓</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 20 }}>
            {results.map(r => {
              const area = areaData[r.locality];
              return (
                <div key={r.locality} className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 2 }}>{r.locality}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 16 }}>{city}</p>
                  <div style={{ fontWeight: 800, color: 'var(--green-700)', fontSize: 20, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>{r.totalListings} listings</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Avg Buy: {formatPrice(r.avgBuyPrice, 'Buy')}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>Avg Rent: {formatPrice(r.avgRentPrice, 'Rent')}</div>
                  {area && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--gray-500)' }}>Overall Rating</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>⭐ {area.overallRating}/5</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: 'var(--gray-500)' }}>Investment Score</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>{area.investmentScore?.toFixed(0)}/100</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--gray-500)' }}>1Y Growth</span>
                        <span style={{ fontWeight: 700, color: area.priceGrowth1Y > 0 ? 'var(--green-700)' : '#ef4444' }}>
                          {area.priceGrowth1Y > 0 ? '+' : ''}{area.priceGrowth1Y?.toFixed(1)}%
                        </span>
                      </div>
                      {area.pros?.length > 0 && (
                        <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--green-50)', borderRadius: 8 }}>
                          {area.pros.slice(0, 2).map(p => <div key={p} style={{ fontSize: 12, color: 'var(--green-700)' }}>✓ {p}</div>)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)', padding: 60, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Select at least 2 localities to compare</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Choose a city and localities above — we'll compare 14 parameters including price, safety, schools, investment score & more</p>
        </div>
      )}
    </div>
  );
}
