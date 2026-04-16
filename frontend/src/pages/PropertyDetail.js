import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { formatPrice, formatArea, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PropertyMap from '../components/PropertyMap';

const IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop',
];

export default function PropertyDetail() {
  const { id } = useParams();
  const { user, saveProperty, isPropertySaved } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(r => setProperty(r.data))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!property) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 64 }}>🏠</div>
      <h2 style={{ marginTop: 16 }}>Property not found</h2>
      <Link to="/properties" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Properties</Link>
    </div>
  );

  const images = property.images?.length ? property.images : IMAGES;
  const saved = isPropertySaved(property._id);

  const priceData = property.priceHistory?.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    price: Math.round(h.price / (property.listingType === 'Buy' ? 100000 : 1000)),
  })) || [];

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <Link to="/properties" style={{ color: 'var(--green-700)', fontSize: 14 }}>← Properties</Link>
        <span style={{ color: 'var(--gray-300)' }}>/</span>
        <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{property.city}</span>
        <span style={{ color: 'var(--gray-300)' }}>/</span>
        <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{property.locality}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>
        <div>
          {/* Image Gallery */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20, position: 'relative', height: 380 }}>
            <img src={images[activeImg]} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.src = IMAGES[0]} />
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6 }}>
              <span className={`tag tag-${property.listingType?.toLowerCase()}`}>{property.listingType}</span>
              {property.hot && <span className="tag tag-hot">🔥 Hot</span>}
              {property.verified && <span className="tag tag-verified">✓ Verified</span>}
            </div>
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImg === i ? 'var(--green-700)' : 'transparent'}` }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = IMAGES[0]} />
                </div>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{property.title}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
              📍 {property.address || `${property.locality}, ${property.city}`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { icon: '🛏', label: 'BHK', val: `${property.bhk} BHK` },
                { icon: '📐', label: 'Area', val: formatArea(property.areaSqft) },
                { icon: '🏢', label: 'Floor', val: `${property.floor} / ${property.totalFloors}` },
                { icon: '🏗', label: 'Age', val: property.ageYears ? `${property.ageYears} yrs` : 'New' },
                { icon: '🪑', label: 'Furnished', val: property.furnishedStatus },
                { icon: '🧭', label: 'Facing', val: property.facing },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>{icon} {label}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{val}</div>
                </div>
              ))}
            </div>

            {property.description && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Description</h3>
                <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: 15 }}>{property.description}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {/* Property Location Map */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📍 Location on Map</h3>
            <PropertyMap property={property} height={280} />
          </div>

          {property.amenities?.length > 0 && (
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {property.amenities.map(a => (
                  <span key={a} style={{ background: 'var(--green-50)', color: 'var(--green-700)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>✓ {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Price History Chart */}
          {priceData.length > 2 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Price History</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}${property.listingType === 'Buy' ? 'L' : 'K'}`} />
                  <Tooltip formatter={(v) => `${v}${property.listingType === 'Buy' ? ' L' : 'K'}`} />
                  <Line type="monotone" dataKey="price" stroke="var(--green-700)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 28, marginBottom: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
              {formatPrice(property.price, property.listingType)}
            </div>
            {property.listingType === 'Buy' && (
              <div style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
                ₹{Math.round(property.price / property.areaSqft).toLocaleString('en-IN')}/sqft
              </div>
            )}

            {!showContact ? (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, marginBottom: 12 }}
                onClick={() => { if (!user) { toast.error('Please login to contact seller'); return; } setShowContact(true); }}>
                📞 Contact Seller
              </button>
            ) : (
              <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{property.sellerName || property.seller?.name}</div>
                <div style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: 16 }}>{property.sellerPhone || property.seller?.phone}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Listed: {formatDate(property.createdAt)}</div>
              </div>
            )}

            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', background: saved ? 'var(--green-50)' : '' }}
              onClick={async () => { if (!user) { toast.error('Please login'); return; } const s = await saveProperty(property._id); toast.success(s ? 'Saved!' : 'Removed'); }}
            >
              {saved ? '❤️ Saved' : '🤍 Save Property'}
            </button>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 12 }}>PROPERTY INFO</div>
            {[
              { label: 'Listed on', val: formatDate(property.createdAt) },
              { label: 'Type', val: property.propertyType },
              { label: 'Views', val: property.views?.toLocaleString() || 0 },
              { label: 'Inquiries', val: property.inquiries || 0 },
              { label: 'Status', val: property.status },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                <span style={{ color: 'var(--gray-500)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          <Link to={`/compare?localities=${property.locality}&city=${property.city}`}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: '12px' }}>
            🔍 Compare This Area
          </Link>
          <Link to={`/price-history?city=${property.city}&locality=${property.locality}`}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: '12px' }}>
            📊 View Price History
          </Link>
        </div>
      </div>
    </div>
  );
}
