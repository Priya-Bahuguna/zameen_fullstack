import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import { CITIES } from '../utils/helpers';
import './Home.css';

const FEATURES = [
  { icon: '🤖', title: 'AI Price Estimator', desc: 'ML-powered fair price estimation trained on real Indian property data. No fraud, just facts.', link: '/ai-estimator' },
  { icon: '📊', title: 'Price History Analysis', desc: 'Track how property prices have changed over time in any locality across India.', link: '/price-history' },
  { icon: '✅', title: 'Verified Listings', desc: 'Every listing is verified. No duplicates, no fake ads — just real properties.', link: '/properties' },
  { icon: '⭐', title: 'Area Ratings', desc: 'Community ratings across safety, schools, connectivity & more for every locality.', link: '/area-ratings' },
  { icon: '💰', title: 'Investment Score', desc: 'Data-backed investment insights to find the best ROI localities in your city.', link: '/investment' },
  { icon: '🔍', title: 'Locality Comparison', desc: 'Compare up to 3 localities side-by-side across 14 key parameters.', link: '/compare' },
];

const TOOLS = [
  { icon: '📈', label: 'Price History', sub: 'Track market trends', link: '/price-history' },
  { icon: '⭐', label: 'Area Ratings', sub: 'Find best localities', link: '/area-ratings' },
  { icon: '💰', label: 'Investment Score', sub: 'Smart ROI insights', link: '/investment' },
  { icon: '🔍', label: 'Compare Areas', sub: 'Side-by-side analysis', link: '/compare' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/properties/featured').then(r => setFeatured(r.data.slice(0, 6))).catch(() => {});
    api.get('/investment/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/properties?city=${search.trim()}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__badge">🏆 India's #1 Smart Property Intelligence Platform</span>
          <h1 className="hero__title">
            Smart Property<br />
            <span className="hero__title-accent">Intelligence Platform</span>
          </h1>
          <p className="hero__desc">
            AI-powered price estimates, transparent market trends, and verified listings. Make data-driven property decisions.
          </p>
          <form onSubmit={handleSearch} className="hero__search">
            <span className="hero__search-icon">🔍</span>
            <input
              className="hero__search-input"
              placeholder="Enter city name — Bangalore, Mumbai, Gurgaon, Hyderabad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="hero__search-btn">Search</button>
          </form>
          <div className="hero__chips">
            {['Bangalore','Mumbai','Delhi','Hyderabad','Pune','Chennai','Gurgaon','Noida','Kolkata','Jaipur'].map(c => (
              <button key={c} className="hero__chip" onClick={() => navigate(`/properties?city=${c}`)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="hero__visual">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format&fit=crop"
            alt="Smart city"
            className="hero__img"
          />
          <div className="hero__live-badge">🟢 Live Market Data</div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="stats-bar">
        {[
          { val: '15,000+', label: 'Verified Listings' },
          { val: '100+', label: 'Indian Cities' },
          { val: '₹0', label: 'Platform Cost' },
          { val: '14+', label: 'Intelligence Parameters' },
        ].map(s => (
          <div key={s.label} className="stats-bar__item">
            <div className="stats-bar__val">{s.val}</div>
            <div className="stats-bar__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Why Zameen */}
      <section className="container" style={{ paddingTop: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title">Why Choose Zameen?</h2>
          <p className="section-subtitle">We combine technology with transparency for data-driven property insights</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <Link to={f.link} key={f.title} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container" style={{ paddingTop: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Featured Properties</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Hand-picked listings across major Indian cities</p>
          </div>
          <Link to="/properties" className="btn btn-outline">View All →</Link>
        </div>
        {featured.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
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
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {featured.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </section>

      {/* Intelligence Tools */}
      <section className="container" style={{ paddingTop: 80, paddingBottom: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title">Intelligence Tools</h2>
          <p className="section-subtitle">Everything you need to make smarter property decisions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {TOOLS.map(t => (
            <Link key={t.label} to={t.link} className="tool-card">
              <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)', marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          Ready to Find Your Dream Property?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, fontSize: 16 }}>
          Join thousands of Zameen users making data-driven decisions
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/properties" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px', background: 'white', color: 'var(--green-700)' }}>
            Browse Properties
          </Link>
          <Link to="/ai-estimator" className="btn btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
            Estimate Price with AI
          </Link>
        </div>
      </section>
    </div>
  );
}
