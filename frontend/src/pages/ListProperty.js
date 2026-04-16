import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CITIES, BHK_OPTIONS, FURNISHED_OPTIONS, PROPERTY_TYPES, FACING_OPTIONS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PropertyMap from '../components/PropertyMap';

const AMENITY_OPTIONS = [
  'Swimming Pool','Gym','Parking','Security','Lift','Club House','Garden',
  'Power Backup','Gas Pipeline','Internet','CCTV','Children Play Area',
  'Jogging Track','Tennis Court','Badminton Court',
];

const defaultForm = {
  title: '', description: '', listingType: 'Buy', price: '',
  city: '', locality: '', address: '',
  bhk: 2, areaSqft: '', floor: '', totalFloors: '', ageYears: '',
  furnishedStatus: 'Semi-Furnished', facing: 'East', propertyType: 'Apartment',
  amenities: [], images: [],
};

export default function ListProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  // FIX 7: Real image state
  const [imageFiles, setImageFiles] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // base64 previews
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);
  const localityRef = useRef(null);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCityChange = (city) => {
    setField('city', city);
    setField('locality', '');
    setLocalitySuggestions([]);
    if (city) {
      api.get(`/properties/localities/${city}`).then(r => setLocalitySuggestions(r.data)).catch(() => {});
    }
  };

  const handleLocalityInput = (val) => {
    setField('locality', val);
    setShowSuggestions(true);
  };

  const filteredSuggestions = localitySuggestions.filter(l =>
    l.toLowerCase().includes((form.locality || '').toLowerCase())
  );

  const toggleAmenity = (a) => {
    setField('amenities', form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]);
  };

  // FIX 7: Handle image file selection — convert to base64 for preview and storage
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = 6 - imageFiles.length;
    if (remaining <= 0) { toast.error('Maximum 6 images allowed'); return; }
    const toAdd = files.slice(0, remaining);

    const newFiles = [...imageFiles, ...toAdd];
    setImageFiles(newFiles);

    // Generate base64 previews
    toAdd.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large (max 5MB)`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target.result]);
        // Store base64 in form.images array
        setForm(f => ({ ...f, images: [...f.images, ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.areaSqft) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!form.city || !form.locality) {
      toast.error('Please enter city and locality');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        bhk: Number(form.bhk),
        areaSqft: Number(form.areaSqft),
        price: Number(form.price),
        floor: Number(form.floor || 0),
        totalFloors: Number(form.totalFloors || 5),
        ageYears: Number(form.ageYears || 0),
        // images already in form.images as base64 strings (or URLs)
      };
      const res = await api.post('/properties', payload);
      toast.success('Property listed successfully! 🎉');
      navigate(`/properties/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px 14px', border: '1.5px solid var(--gray-300)',
    borderRadius: 10, fontSize: 14, width: '100%', outline: 'none',
    fontFamily: 'inherit', transition: 'var(--transition)',
  };
  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: 'var(--gray-500)',
    letterSpacing: '0.5px', display: 'block', marginBottom: 6,
  };
  const focus = e => e.target.style.borderColor = 'var(--green-500)';
  const blur  = e => e.target.style.borderColor = 'var(--gray-300)';

  const steps = ['Basic Info', 'Location', 'Property Details', 'Photos & Amenities'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>➕</span>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>List Your Property</h1>
        </div>
        <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Fill in details to list your property. Verified listings get 3× more inquiries.</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', marginBottom: 36 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > i + 1 ? 'var(--green-700)' : step === i + 1 ? 'var(--green-700)' : 'var(--gray-200)', color: step >= i + 1 ? 'white' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? 'var(--green-700)' : 'var(--gray-400)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--green-500)' : 'var(--gray-200)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'flex-start' }}>
        <div>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="card animate-fade" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>📌 Basic Information</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>PROPERTY TITLE *</label>
                <input style={inputStyle} placeholder="e.g. Spacious 3BHK in Koramangala with Terrace"
                  value={form.title} onChange={e => setField('title', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  placeholder="Describe your property — layout, special features, nearby landmarks..."
                  value={form.description} onChange={e => setField('description', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>LISTING TYPE *</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Buy', 'Rent'].map(t => (
                      <button key={t} type="button" onClick={() => setField('listingType', t)}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid', borderColor: form.listingType === t ? 'var(--green-700)' : 'var(--gray-300)', background: form.listingType === t ? 'var(--green-50)' : 'white', color: form.listingType === t ? 'var(--green-700)' : 'var(--gray-700)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {t === 'Buy' ? '🏠' : '🔑'} For {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>PRICE (₹) *</label>
                  <input style={inputStyle} type="number"
                    placeholder={form.listingType === 'Rent' ? 'Monthly rent e.g. 25000' : 'Total price e.g. 5000000'}
                    value={form.price} onChange={e => setField('price', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="card animate-fade" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>📍 Location</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>CITY *</label>
                  <input list="lp-city-list" style={inputStyle}
                    placeholder="Type any city in India..."
                    value={form.city} onChange={e => handleCityChange(e.target.value)} onFocus={focus} onBlur={blur} />
                  <datalist id="lp-city-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label style={labelStyle}>LOCALITY / AREA *</label>
                  <div style={{ position: 'relative' }} ref={localityRef}>
                    <input style={inputStyle}
                      placeholder="Type any area — e.g. Koramangala, Sector 21..."
                      value={form.locality}
                      onChange={e => handleLocalityInput(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      autoComplete="off" />
                    {showSuggestions && form.locality && filteredSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                        {filteredSuggestions.slice(0, 8).map(s => (
                          <div key={s} onMouseDown={() => { setField('locality', s); setShowSuggestions(false); }}
                            style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--green-50)'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}>
                            📍 {s}
                          </div>
                        ))}
                      </div>
                    )}
                    {showSuggestions && form.locality && filteredSuggestions.length === 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: '10px 14px', marginTop: 4, fontSize: 13, color: 'var(--gray-500)' }}>
                        ✅ "{form.locality}" will be added as a new locality
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>FULL ADDRESS</label>
                <input style={inputStyle} placeholder="e.g. 123, 5th Block, Koramangala, Bangalore - 560034"
                  value={form.address} onChange={e => setField('address', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>

              {/* Live map preview */}
              {(form.city || form.locality) && (
                <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>📍 LOCATION PREVIEW</label>
                  <PropertyMap property={{ city: form.city, locality: form.locality, address: form.address }} height={220} />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Property Details */}
          {step === 3 && (
            <div className="card animate-fade" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>🏗 Property Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'BHK *', type: 'select', val: form.bhk, onChange: e => setField('bhk', e.target.value), options: BHK_OPTIONS.map(b => ({ val: b, label: `${b} BHK` })) },
                  { label: 'AREA (SQFT) *', type: 'number', val: form.areaSqft, onChange: e => setField('areaSqft', e.target.value), placeholder: 'e.g. 1200' },
                  { label: 'AGE (YEARS)', type: 'number', val: form.ageYears, onChange: e => setField('ageYears', e.target.value), placeholder: 'e.g. 3' },
                  { label: 'FLOOR NO.', type: 'number', val: form.floor, onChange: e => setField('floor', e.target.value), placeholder: 'e.g. 5' },
                  { label: 'TOTAL FLOORS', type: 'number', val: form.totalFloors, onChange: e => setField('totalFloors', e.target.value), placeholder: 'e.g. 12' },
                  { label: 'PROPERTY TYPE', type: 'select', val: form.propertyType, onChange: e => setField('propertyType', e.target.value), options: PROPERTY_TYPES.map(t => ({ val: t, label: t })) },
                  { label: 'FURNISHED STATUS', type: 'select', val: form.furnishedStatus, onChange: e => setField('furnishedStatus', e.target.value), options: FURNISHED_OPTIONS.map(f => ({ val: f, label: f })) },
                  { label: 'FACING', type: 'select', val: form.facing, onChange: e => setField('facing', e.target.value), options: FACING_OPTIONS.map(f => ({ val: f, label: f })) },
                ].map(({ label, type, val, onChange, placeholder, options }) => (
                  <div key={label}>
                    <label style={labelStyle}>{label}</label>
                    {type === 'select' ? (
                      <select style={inputStyle} value={val} onChange={onChange}>
                        {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input style={inputStyle} type="number" placeholder={placeholder} value={val} onChange={onChange} onFocus={focus} onBlur={blur} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Photos & Amenities */}
          {step === 4 && (
            <div className="card animate-fade" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📷 Property Photos</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Upload your own photos (up to 6). Only your real photos will be shown — no fake or generated images.</p>

              {/* Image upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed var(--gray-300)', borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, background: 'var(--gray-50)', transition: 'var(--transition)' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green-500)'; e.currentTarget.style.background = 'var(--green-50)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Click to upload photos</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>JPG, PNG, WebP · Max 5MB each · Up to 6 photos</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
              </div>

              {/* Preview grid */}
              {imagePreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === 0 && (
                        <div style={{ position: 'absolute', top: 6, left: 6, background: 'var(--green-700)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>COVER</div>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 6 && (
                    <div onClick={() => fileInputRef.current?.click()}
                      style={{ border: '2px dashed var(--gray-300)', borderRadius: 10, aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 13 }}>
                      <span style={{ fontSize: 24 }}>+</span>
                      <span>Add more</span>
                    </div>
                  )}
                </div>
              )}

              {imagePreviews.length === 0 && (
                <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
                  💡 Properties with photos get <strong>3× more inquiries</strong>. Please upload at least one real photo of your property.
                </div>
              )}

              {/* Amenities */}
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 8 }}>✨ Amenities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {AMENITY_OPTIONS.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{ padding: '8px 16px', borderRadius: 20, border: '2px solid', borderColor: form.amenities.includes(a) ? 'var(--green-700)' : 'var(--gray-300)', background: form.amenities.includes(a) ? 'var(--green-50)' : 'white', color: form.amenities.includes(a) ? 'var(--green-700)' : 'var(--gray-700)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'var(--transition)' }}>
                    {form.amenities.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>
              {form.amenities.length > 0 && (
                <p style={{ marginTop: 14, fontSize: 14, color: 'var(--green-700)', fontWeight: 600 }}>
                  {form.amenities.length} amenities selected
                </p>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            {step > 1 ? (
              <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            ) : <div />}
            {step < 4 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue →</button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '12px 32px', fontSize: 16 }}>
                {loading ? '⏳ Listing...' : '🚀 List Property'}
              </button>
            )}
          </div>
        </div>

        {/* Tips sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💡 Tips for Better Response</h3>
            {[
              'Add clear, accurate description',
              'Upload real photos of the property',
              'Include nearby landmarks',
              'Mention all amenities',
              'Set a realistic price',
              'Respond quickly to inquiries',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--gray-700)' }}>
                <span style={{ color: 'var(--green-700)' }}>✓</span> {t}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🏆 Verified Listings Get</h3>
            {[['3×', 'more inquiries'], ['40%', 'faster closing'], ['2×', 'better visibility']].map(([val, label]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{val}</span>
                <span style={{ fontSize: 14, color: 'var(--gray-600)', marginLeft: 8 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Step 4 photo reminder */}
          {step !== 4 && (
            <div className="card" style={{ padding: 20, marginTop: 16, background: 'var(--green-50)', border: '1.5px solid var(--green-200)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-700)', marginBottom: 6 }}>📷 Don't forget photos!</div>
              <div style={{ fontSize: 12, color: 'var(--green-700)' }}>In Step 4, upload your real property photos. Only your photos will be shown — no fake images.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
