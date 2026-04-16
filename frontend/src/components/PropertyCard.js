import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatArea } from '../utils/helpers';
import toast from 'react-hot-toast';

// Default placeholder — only used when NO image exists at all
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop';

function getImage(property) {
  // If property has images uploaded by seller, use those
  if (property.images && property.images.length > 0 && property.images[0]) {
    return property.images[0];
  }
  // No image at all — show placeholder with label
  return null;
}

export default function PropertyCard({ property }) {
  const { user, saveProperty, isPropertySaved } = useAuth();
  const saved = isPropertySaved(property._id);
  const img = getImage(property);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save properties'); return; }
    try {
      const isSaved = await saveProperty(property._id);
      toast.success(isSaved ? 'Property saved!' : 'Removed from saved');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <Link to={`/properties/${property._id}`} className="card" style={{ display: 'block', transition: 'var(--transition)', textDecoration: 'none' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>

      <div style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--gray-100)' }}>
        {img ? (
          <img src={img} alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex'); }}
          />
        ) : null}
        {/* No image fallback */}
        <div style={{ display: img ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--gray-400)' }}>
          <span style={{ fontSize: 40 }}>🏠</span>
          <span style={{ fontSize: 12, marginTop: 6 }}>No photo uploaded</span>
        </div>

        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className={`tag tag-${property.listingType?.toLowerCase()}`}>{property.listingType}</span>
          {property.hot && <span className="tag tag-hot">🔥 Hot</span>}
          {property.verified && <span className="tag tag-verified">✓ Verified</span>}
        </div>
        <button onClick={handleSave}
          style={{ position: 'absolute', top: 12, right: 12, background: saved ? 'var(--green-700)' : 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'var(--transition)' }}>
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, lineHeight: 1.3 }}>{property.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          📍 {property.locality}, {property.city}
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {[`🛏 ${property.bhk} BHK`, `📐 ${formatArea(property.areaSqft)}`, property.furnishedStatus].map(tag => (
            <span key={tag} style={{ background: 'var(--gray-100)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>
              {formatPrice(property.price, property.listingType)}
            </div>
            {property.listingType === 'Buy' && property.areaSqft && (
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                ₹{Math.round(property.price / property.areaSqft).toLocaleString('en-IN')}/sqft
              </div>
            )}
          </div>
          <span style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 600 }}>View Details →</span>
        </div>
      </div>
    </Link>
  );
}
