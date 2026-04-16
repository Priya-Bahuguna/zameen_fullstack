import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import api from '../utils/api';
import { CITIES, formatPrice } from '../utils/helpers';

const RISK_LEVELS = {
  high: { label: 'High Risk', color: '#ef4444', bg: '#fee2e2', desc: 'Volatile market, high reward potential' },
  medium: { label: 'Moderate Risk', color: '#f59e0b', bg: '#fef9c3', desc: 'Balanced risk-reward ratio' },
  low: { label: 'Low Risk', color: '#16a34a', bg: '#dcfce7', desc: 'Stable market, steady returns' },
};

const getRisk = (score, growth) => {
  if (score >= 80 && growth >= 10) return 'high';
  if (score >= 60 || growth >= 5) return 'medium';
  return 'low';
};

const getBudgetAdvice = (avgBuy) => {
  if (avgBuy >= 10000000) return { label: 'Premium (₹1Cr+)', color: '#7c3aed', icon: '💎' };
  if (avgBuy >= 5000000) return { label: 'Mid-segment (₹50L–1Cr)', color: '#2563eb', icon: '🏠' };
  if (avgBuy >= 2000000) return { label: 'Affordable (₹20L–50L)', color: '#16a34a', icon: '🏡' };
  return { label: 'Budget (Under ₹20L)', color: '#92400e', icon: '🏘' };
};

export default function Investment() {
  const [cityInput, setCityInput] = useState('');
  const [city, setCity] = useState(''); // applied city filter
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLocality, setActiveLocality] = useState(null);
  const [investGoal, setInvestGoal] = useState('all');

  const applyCity = (val) => {
    setCity(val);
    setActiveLocality(null); // clear old locality when city changes
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/investment/insights', { params: city ? { city } : {} }),
      api.get('/investment/stats', { params: city ? { city } : {} }),
    ]).then(([ins, st]) => {
      setInsights(ins.data);
      setStats(st.data);
      if (ins.data.length) setActiveLocality(ins.data[0]);
      else setActiveLocality(null);
    }).catch(() => { setInsights([]); setActiveLocality(null); }).finally(() => setLoading(false));
  }, [city]);

  const selStyle = { padding: '10px 14px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'white' };

  // Apply goal filter, but fall back to all insights if filter returns nothing
  const goalFiltered = insights.filter(a => {
    if (investGoal === 'rental') return (a.avgPriceRent / Math.max(a.avgPriceBuy || 1, 1)) > 0.002;
    if (investGoal === 'appreciation') return (a.priceGrowth1Y || 0) >= 5; // lowered threshold
    if (investGoal === 'affordable') return !a.avgPriceBuy || a.avgPriceBuy < 8000000; // 80L threshold
    return true;
  });
  // If goal filter gives no results, show all (graceful fallback)
  const filteredInsights = goalFiltered.length > 0 ? goalFiltered : insights;
  const isFilterFallback = goalFiltered.length === 0 && insights.length > 0 && investGoal !== 'all';

  const radarData = activeLocality ? [
    { subject: 'Safety', val: activeLocality.ratings?.safety || 0, max: 5 },
    { subject: 'Connectivity', val: activeLocality.ratings?.connectivity || 0, max: 5 },
    { subject: 'Schools', val: activeLocality.ratings?.schools || 0, max: 5 },
    { subject: 'Hospitals', val: activeLocality.ratings?.hospitals || 0, max: 5 },
    { subject: 'Markets', val: activeLocality.ratings?.markets || 0, max: 5 },
    { subject: 'Transport', val: activeLocality.ratings?.publicTransport || 0, max: 5 },
  ] : [];

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>💰 Investment Insights</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Data-backed guidance — where to invest, why, and what to expect</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input list="inv-city-list" style={{ ...selStyle, minWidth: 180 }} value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyCity(cityInput)}
            placeholder="Type any city..." />
          <datalist id="inv-city-list">
            <option value="" />
            {CITIES.map(c => <option key={c} value={c} />)}
          </datalist>
          <button className="btn btn-primary" onClick={() => applyCity(cityInput)} style={{ whiteSpace: 'nowrap' }}>
            🔍 Search
          </button>
          {city && <button className="btn btn-outline" onClick={() => { setCityInput(''); applyCity(''); }} style={{ whiteSpace: 'nowrap' }}>Clear</button>}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🏆 All' },
            { key: 'appreciation', label: '📈 High Growth (8%+ p.a.)' },
            { key: 'rental', label: '🔑 Best Rental Yield' },
            { key: 'affordable', label: '💚 Affordable (Under 50L)' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setInvestGoal(key)}
              style={{ padding: '8px 16px', borderRadius: 20, border: '1.5px solid', borderColor: investGoal === key ? 'var(--green-700)' : 'var(--gray-300)', background: investGoal === key ? 'var(--green-700)' : 'white', color: investGoal === key ? 'white' : 'var(--gray-700)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Market overview */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
          {stats.byCity?.slice(0, 8).map(c => (
            <button key={c._id} onClick={() => { const v = c._id === city ? '' : c._id; setCityInput(v); applyCity(v); }}
              className="card" style={{ padding: 18, textAlign: 'left', border: '1.5px solid', borderColor: city === c._id ? 'var(--green-700)' : 'transparent', cursor: 'pointer', background: city === c._id ? 'var(--green-50)' : 'white', transition: 'var(--transition)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: city === c._id ? 'var(--green-700)' : 'var(--gray-900)' }}>{c._id}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{c.count}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>listings</div>
            </button>
          ))}
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>

          {/* Left: Ranked list */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                {investGoal === 'appreciation' ? '📈 High Growth Localities' :
                 investGoal === 'rental' ? '🔑 Best Rental Yield' :
                 investGoal === 'affordable' ? '💚 Affordable Localities' :
                 '🏆 Top Investment Localities'}
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isFilterFallback && <span style={{ fontSize: 11, color: '#f59e0b', background: '#fef9c3', padding: '2px 8px', borderRadius: 10 }}>Showing all (no exact matches)</span>}
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{filteredInsights.length} found</span>
              </div>
            </div>

            {filteredInsights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>No localities match this filter</div>
            ) : (
              filteredInsights.slice(0, 10).map((a, i) => {
                const risk = getRisk(a.investmentScore, a.priceGrowth1Y);
                const budget = getBudgetAdvice(a.avgPriceBuy);
                const isActive = activeLocality?.locality === a.locality && activeLocality?.city === a.city;
                return (
                  <div key={`${a.city}-${a.locality}`}
                    onClick={() => setActiveLocality(a)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', borderRadius: 10, background: isActive ? 'var(--green-50)' : 'transparent', transition: 'var(--transition)' }}
                    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < 3 ? 'var(--green-700)' : 'var(--gray-100)', color: i < 3 ? 'white' : 'var(--gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{a.locality}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{a.city} · {budget.icon} {budget.label}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: RISK_LEVELS[risk].bg, color: RISK_LEVELS[risk].color }}>{RISK_LEVELS[risk].label}</span>
                        <span style={{ fontSize: 10, color: a.priceGrowth1Y > 0 ? 'var(--green-700)' : '#ef4444', fontWeight: 700 }}>
                          {a.priceGrowth1Y > 0 ? '+' : ''}{a.priceGrowth1Y?.toFixed(1)}% 1Y
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{a.investmentScore?.toFixed(0)}</div>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>score</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Detail panel for selected locality */}
          {activeLocality && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{activeLocality.locality}</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>{activeLocality.city}</p>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--green-50)', borderRadius: 12, padding: '10px 18px' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{activeLocality.investmentScore?.toFixed(0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Investment Score</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Avg Buy Price', val: formatPrice(activeLocality.avgPriceBuy, 'Buy') },
                    { label: 'Avg Rent/mo', val: formatPrice(activeLocality.avgPriceRent, 'Rent') },
                    { label: '1Y Price Growth', val: `${activeLocality.priceGrowth1Y > 0 ? '+' : ''}${activeLocality.priceGrowth1Y?.toFixed(1)}%`, color: activeLocality.priceGrowth1Y > 0 ? 'var(--green-700)' : '#ef4444' },
                    { label: 'Overall Rating', val: `⭐ ${activeLocality.overallRating}/5` },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: color || 'var(--gray-900)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Verdict */}
                <div style={{ background: 'linear-gradient(135deg, var(--green-50), #ecfdf5)', border: '1.5px solid var(--green-200)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-800)', marginBottom: 6 }}>
                    {activeLocality.investmentScore >= 80 ? '🏆 Excellent Investment Choice' :
                     activeLocality.investmentScore >= 60 ? '✅ Good Investment Potential' :
                     activeLocality.investmentScore >= 40 ? '📊 Moderate Investment' : '⚠️ Invest with Caution'}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--green-700)', lineHeight: 1.6 }}>
                    {activeLocality.description || `${activeLocality.locality} is a ${activeLocality.overallRating >= 4 ? 'premium' : activeLocality.overallRating >= 3 ? 'well-established' : 'developing'} locality in ${activeLocality.city}.`}
                  </p>
                </div>
              </div>

              {/* Radar chart */}
              {radarData.length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📡 Area Quality Radar</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--gray-200)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--gray-600)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
                      <Radar name="Rating" dataKey="val" stroke="var(--green-700)" fill="var(--green-700)" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pros/Cons */}
              {(activeLocality.pros?.length > 0 || activeLocality.cons?.length > 0) && (
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--green-700)', marginBottom: 10 }}>✅ Pros</div>
                      {activeLocality.pros?.map(p => <div key={p} style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 6, display: 'flex', gap: 6 }}><span style={{ color: 'var(--green-500)' }}>✓</span>{p}</div>)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 10 }}>⚠️ Cons</div>
                      {activeLocality.cons?.map(c => <div key={c} style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 6, display: 'flex', gap: 6 }}><span style={{ color: '#f87171' }}>✗</span>{c}</div>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bar chart of top localities */}
      {filteredInsights.length > 0 && (
        <div className="card" style={{ padding: 28, marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 Investment Score Comparison</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredInsights.slice(0, 10).map(a => ({ name: a.locality.split(' ')[0], score: Number(a.investmentScore?.toFixed(0)), growth: Number(a.priceGrowth1Y?.toFixed(1)), city: a.city }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'score' ? `${v}/100` : `${v}%`, n === 'score' ? 'Investment Score' : '1Y Growth']} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} name="score">
                {filteredInsights.slice(0, 10).map((a, i) => (
                  <Cell key={i} fill={a.investmentScore >= 80 ? 'var(--green-700)' : a.investmentScore >= 60 ? '#22c55e' : '#86efac'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* How score is calculated */}
      <div style={{ padding: 28, background: 'linear-gradient(135deg, #0f172a, #1a3a1a)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📈 How to Choose Where to Invest</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: '📈', title: 'For Appreciation', desc: 'Filter by "High Growth" (8%+ p.a.). Look for areas with new infrastructure, IT parks, or metro expansion.' },
            { icon: '🔑', title: 'For Rental Income', desc: 'Filter by "Best Rental Yield". Areas near universities, offices, or hospitals give consistent rental returns.' },
            { icon: '💚', title: 'First-time Buyer', desc: 'Filter "Affordable". Look for localities with Investment Score 60+ — they are growth areas at lower entry price.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'white' }}>{title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
