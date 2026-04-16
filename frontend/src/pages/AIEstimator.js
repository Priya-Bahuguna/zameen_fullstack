import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CITIES, BHK_OPTIONS, FURNISHED_OPTIONS, PROPERTY_TYPES, FACING_OPTIONS, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const defaultForm = {
  listingType: 'Buy', city: 'Bangalore', locality: '', bhk: 2, areaSqft: '',
  floor: '', totalFloors: '', ageYears: '', furnishedStatus: 'Semi-Furnished',
  facing: 'East', propertyType: 'Apartment',
};

export default function AIEstimator() {
  const [form, setForm] = useState(defaultForm);
  const [localities, setLocalities] = useState([]);
  const [result, setResult] = useState(null);
  const [userPrice, setUserPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.city) {
      api.get(`/properties/localities/${form.city}`).then(r => setLocalities(r.data)).catch(() => {});
    }
  }, [form.city]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEstimate = async () => {
    if (!form.areaSqft) { toast.error('Please enter area in sqft'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ml/estimate', {
        ...form,
        areaSqft: Number(form.areaSqft),
        bhk: Number(form.bhk),
        floor: Number(form.floor || 0),
        totalFloors: Number(form.totalFloors || 5),
        ageYears: Number(form.ageYears || 0),
      });
      setResult(res.data);
    } catch {
      toast.error('Estimation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIX 3: Fair price verdict logic
  const getFairVerdict = () => {
    if (!result || !userPrice) return null;
    const predicted = result.predicted_price;
    const low = result.price_range?.low;
    const high = result.price_range?.high;
    const entered = Number(userPrice);
    if (!entered || !predicted) return null;

    const diffPct = ((entered - predicted) / predicted) * 100;

    if (entered >= low && entered <= high) {
      return { label: '✅ Fair Price', color: '#16a34a', bg: '#dcfce7', detail: `This price is within the fair market range (${formatPrice(low, form.listingType)} – ${formatPrice(high, form.listingType)}). Good deal!` };
    } else if (entered < low) {
      const saving = low - entered;
      return { label: '🟢 Underpriced!', color: '#15803d', bg: '#dcfce7', detail: `This property is priced ${Math.abs(diffPct).toFixed(0)}% below market. You're saving ${formatPrice(saving, form.listingType)} — great opportunity!` };
    } else if (diffPct <= 20) {
      return { label: '🟡 Slightly Overpriced', color: '#92400e', bg: '#fef9c3', detail: `This property is ${diffPct.toFixed(0)}% above our estimate. You may be able to negotiate down to ${formatPrice(predicted, form.listingType)}.` };
    } else {
      return { label: '🔴 Overpriced', color: '#991b1b', bg: '#fee2e2', detail: `This property is ${diffPct.toFixed(0)}% above market value. Fair price should be around ${formatPrice(predicted, form.listingType)}. Negotiate hard or look for alternatives.` };
    }
  };

  const verdict = getFairVerdict();
  const inputStyle = { padding: '12px 14px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, width: '100%', outline: 'none', transition: 'var(--transition)', fontFamily: 'inherit' };

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>🤖</span>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>AI Price Estimator</h1>
        </div>
        <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>
          Powered by <strong style={{ color: 'var(--green-700)' }}>Random Forest ML Model</strong> — trained on real Indian property records
        </p>
      </div>

      {/* Listing type toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {['Buy', 'Rent'].map(t => (
          <button key={t} onClick={() => setField('listingType', t)}
            style={{ padding: '10px 28px', borderRadius: 10, border: '2px solid', borderColor: form.listingType === t ? 'var(--green-700)' : 'var(--gray-300)', background: form.listingType === t ? 'var(--green-700)' : 'white', color: form.listingType === t ? 'white' : 'var(--gray-700)', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'var(--transition)' }}>
            {t === 'Buy' ? '🏠' : '🔑'} {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, alignItems: 'flex-start' }}>
        {/* Form */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 24 }}>Property Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>CITY *</label>
              <input list="estimator-city-list" style={inputStyle} placeholder="Type city name..."
                value={form.city} onChange={e => { setField('city', e.target.value); setField('locality', ''); }} />
              <datalist id="estimator-city-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>LOCALITY</label>
              <input list="estimator-locality-list" style={inputStyle} placeholder="Type any locality..."
                value={form.locality} onChange={e => setField('locality', e.target.value)} />
              <datalist id="estimator-locality-list">{localities.map(l => <option key={l} value={l} />)}</datalist>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>BHK *</label>
              <select style={inputStyle} value={form.bhk} onChange={e => setField('bhk', e.target.value)}>
                {BHK_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>AREA (SQFT) *</label>
              <input style={inputStyle} type="number" placeholder="e.g. 1200" value={form.areaSqft} onChange={e => setField('areaSqft', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>FLOOR</label>
              <input style={inputStyle} type="number" placeholder="e.g. 5" value={form.floor} onChange={e => setField('floor', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>TOTAL FLOORS</label>
              <input style={inputStyle} type="number" placeholder="e.g. 12" value={form.totalFloors} onChange={e => setField('totalFloors', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>AGE (YEARS)</label>
              <input style={inputStyle} type="number" placeholder="e.g. 3" value={form.ageYears} onChange={e => setField('ageYears', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>FURNISHED STATUS</label>
              <select style={inputStyle} value={form.furnishedStatus} onChange={e => setField('furnishedStatus', e.target.value)}>
                {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>FACING</label>
              <select style={inputStyle} value={form.facing} onChange={e => setField('facing', e.target.value)}>
                {FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>PROPERTY TYPE</label>
              <select style={inputStyle} value={form.propertyType} onChange={e => setField('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* FIX 3: User can enter actual asking price to check fairness */}
          <div style={{ marginTop: 24, padding: '18px 20px', background: 'var(--gray-50)', borderRadius: 12, border: '1.5px dashed var(--gray-300)' }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>
              💡 Check if a property's asking price is fair (optional)
            </label>
            <input style={{ ...inputStyle, background: 'white' }} type="number"
              placeholder={form.listingType === 'Rent' ? "Enter seller's monthly rent (₹)" : "Enter seller's asking price (₹)"}
              value={userPrice} onChange={e => setUserPrice(e.target.value)} />
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>Enter the actual price you saw — we'll tell you if it's fair, overpriced, or a steal</p>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '16px', fontSize: 17 }}
            onClick={handleEstimate} disabled={loading}>
            {loading ? '⏳ Estimating...' : '🤖 Estimate Fair Price'}
          </button>
        </div>

        {/* Result Panel */}
        <div>
          <div className="card" style={{ padding: 32 }}>
            {!result ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>ML-Powered Estimation</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Fill in property details and click Estimate Price</p>
                <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 8 }}>Our Random Forest model analyzes 14 features to predict fair market price</p>
              </div>
            ) : (
              <div className="animate-fade">
                {/* Estimated price */}
                <div style={{ textAlign: 'center', padding: '20px 0 24px', borderBottom: '1px solid var(--gray-100)', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', marginBottom: 6 }}>ML ESTIMATED FAIR PRICE</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
                    {formatPrice(result.predicted_price, form.listingType)}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                    Fair range: {formatPrice(result.price_range?.low, form.listingType)} – {formatPrice(result.price_range?.high, form.listingType)}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Model Confidence</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-700)' }}>{Math.round((result.confidence || 0.75) * 100)}%</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(result.confidence || 0.75) * 100}%`, background: 'var(--green-500)', borderRadius: 4 }} />
                    </div>
                  </div>
                </div>

                {/* FIX 3: Fair price verdict */}
                {verdict && (
                  <div style={{ background: verdict.bg, border: `2px solid ${verdict.color}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: verdict.color, marginBottom: 6 }}>{verdict.label}</div>
                    <div style={{ fontSize: 13, color: verdict.color, lineHeight: 1.6 }}>{verdict.detail}</div>
                  </div>
                )}

                {/* No user price entered but result exists — prompt them */}
                {!userPrice && result && (
                  <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
                    💡 <strong>Tip:</strong> Enter the seller's asking price in the form to see if it's fair or overpriced!
                  </div>
                )}

                {/* Top factors */}
                {result.top_factors && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', marginBottom: 12 }}>KEY PRICE FACTORS</div>
                    {result.top_factors.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 14, color: 'var(--gray-700)' }}>{f.factor}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 80, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${f.impact}%`, background: 'var(--green-500)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-700)', width: 36 }}>{f.impact}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 12, fontSize: 12, color: 'var(--gray-400)' }}>
                  <strong>Model:</strong> {result.model_used || 'RandomForest'} &nbsp;|&nbsp;
                  <strong>Source:</strong> {result.source === 'ml_model' ? 'ML Prediction' : 'Heuristic Estimate'}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>✅ Why Trust This Estimate?</div>
            {['No commission or bias — pure data', 'Trained on 5000+ Indian property records', 'Compares location, size, age, amenities & more', 'Enter asking price to instantly check if it is fair'].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--gray-700)' }}>
                <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
