import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import PropertyCard from '../components/PropertyCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('saved');
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    if (isSeller) {
      setActiveTab('listings');
      api.get('/properties/seller/my-listings')
        .then(r => setMyListings(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isSeller]);

  // Load saved properties when Saved tab is active
  useEffect(() => {
    if (activeTab === 'saved' && user?.savedProperties?.length > 0) {
      setSavedLoading(true);
      // Fetch each saved property
      Promise.all(
        user.savedProperties.map(id =>
          api.get(`/properties/${id}`).then(r => r.data).catch(() => null)
        )
      ).then(results => {
        setSavedProperties(results.filter(Boolean));
      }).finally(() => setSavedLoading(false));
    } else if (activeTab === 'saved') {
      setSavedProperties([]);
    }
  }, [activeTab, user?.savedProperties]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setMyListings(prev => prev.filter(p => p._id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleStatus = async (property) => {
    try {
      const newStatus = property.status === 'active' ? 'inactive' : 'active';
      await api.put(`/properties/${property._id}`, { status: newStatus });
      setMyListings(prev => prev.map(p => p._id === property._id ? { ...p, status: newStatus } : p));
      toast.success(`Listing ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update'); }
  };

  const startEdit = () => {
    setEditForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', editForm);
      await updateUser(); // refresh user in context
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const card = { background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Welcome back, <strong>{user?.name}</strong> · <span style={{ background: isSeller ? 'var(--green-100)' : '#dbeafe', color: isSeller ? 'var(--green-700)' : '#1d4ed8', padding: '2px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{user?.role?.toUpperCase()}</span></p>
        </div>
        {isSeller && (
          <Link to="/list-property" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
            + List New Property
          </Link>
        )}
      </div>

      {/* Seller stats */}
      {isSeller && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Listings', val: myListings.length, icon: '🏠', color: 'var(--green-700)' },
            { label: 'Active Listings', val: myListings.filter(p => p.status === 'active').length, icon: '✅', color: '#22c55e' },
            { label: 'Total Views', val: myListings.reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), icon: '👁', color: '#3b82f6' },
            { label: 'Total Inquiries', val: myListings.reduce((s, p) => s + (p.inquiries || 0), 0), icon: '📞', color: '#f59e0b' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} style={{ ...card, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Buyer quick tools */}
      {!isSeller && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--gray-600)' }}>Quick Tools</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { icon: '🏠', label: 'Browse Properties', link: '/properties' },
              { icon: '🤖', label: 'AI Price Estimator', link: '/ai-estimator' },
              { icon: '📊', label: 'Price History', link: '/price-history' },
              { icon: '⭐', label: 'Area Ratings', link: '/area-ratings' },
              { icon: '💰', label: 'Investment Insights', link: '/investment' },
              { icon: '🔍', label: 'Compare Areas', link: '/compare' },
            ].map(t => (
              <Link key={t.label} to={t.link} className="card" style={{ padding: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, transition: 'var(--transition)' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Profile card */}
      <div style={{ ...card, padding: 24, marginBottom: 24 }}>
        {editing ? (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>✏️ Edit Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>NAME</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  style={{ padding: '10px 12px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, width: '100%', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>PHONE</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ padding: '10px 12px', border: '1.5px solid var(--gray-300)', borderRadius: 10, fontSize: 14, width: '100%', outline: 'none' }}
                  placeholder="+91-9876543210" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.name}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{user?.email}{user?.phone && ` · ${user.phone}`}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{ background: isSeller ? 'var(--green-100)' : '#dbeafe', color: isSeller ? 'var(--green-700)' : '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{user?.role}</span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={startEdit} style={{ fontSize: 13, padding: '8px 16px', flexShrink: 0 }}>✏️ Edit Profile</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--gray-100)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {(isSeller ? [['listings', '🏠 My Listings'], ['saved', '❤️ Saved']] : [['saved', '❤️ Saved Properties']]).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: activeTab === key ? 'white' : 'transparent', color: activeTab === key ? 'var(--gray-900)' : 'var(--gray-500)', fontWeight: activeTab === key ? 700 : 500, cursor: 'pointer', fontSize: 14, boxShadow: activeTab === key ? 'var(--shadow)' : 'none', transition: 'var(--transition)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* My Listings tab */}
      {activeTab === 'listings' && isSeller && (
        loading ? <div className="spinner" /> : myListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, ...card }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <h3>No listings yet</h3>
            <p style={{ color: 'var(--gray-500)', marginTop: 8, marginBottom: 24 }}>List your first property to get started</p>
            <Link to="/list-property" className="btn btn-primary">+ List Property</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myListings.map(p => (
              <div key={p._id} style={{ ...card, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className={`tag tag-${p.listingType?.toLowerCase()}`}>{p.listingType}</span>
                    <span style={{ background: p.status === 'active' ? 'var(--green-100)' : 'var(--gray-100)', color: p.status === 'active' ? 'var(--green-700)' : 'var(--gray-500)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.status?.toUpperCase()}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>📍 {p.locality}, {p.city} · {p.bhk} BHK · {p.areaSqft} sqft</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Listed: {formatDate(p.createdAt)}</p>
                </div>
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-700)', fontFamily: 'Sora, sans-serif' }}>{formatPrice(p.price, p.listingType)}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.views || 0} views · {p.inquiries || 0} inquiries</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <Link to={`/properties/${p._id}`} className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px' }}>View</Link>
                  <button onClick={() => handleToggleStatus(p)} className="btn" style={{ fontSize: 13, padding: '8px 14px', background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                    {p.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="btn" style={{ fontSize: 13, padding: '8px 14px', background: '#fee2e2', color: '#991b1b' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Saved Properties tab */}
      {activeTab === 'saved' && (
        savedLoading ? <div className="spinner" /> :
        savedProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, ...card }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❤️</div>
            <h3>No saved properties yet</h3>
            <p style={{ color: 'var(--gray-500)', marginTop: 8, marginBottom: 24 }}>Browse properties and click the heart ❤️ to save them here</p>
            <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 20 }}>{savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {savedProperties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
