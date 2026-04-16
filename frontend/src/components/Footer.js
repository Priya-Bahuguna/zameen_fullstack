import React from 'react';
import { Link } from 'react-router-dom';
import ZameenLogo from './ZameenLogo';
import { CITIES } from '../utils/helpers';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark-800)', color: 'rgba(255,255,255,0.75)', paddingTop: 60, paddingBottom: 32, marginTop: 80 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <ZameenLogo size={36} textColor="white" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 300, color: 'rgba(255,255,255,0.55)' }}>
              India's smartest property intelligence platform. Data-driven decisions for every buyer, renter, and investor.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {['🏆 No Fake Ads', '🤖 AI Powered', '🔒 Verified Listings'].map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 20, fontSize: 14, letterSpacing: '0.5px' }}>FEATURES</h4>
            {[['Browse Properties', '/properties'], ['AI Price Estimator', '/ai-estimator'], ['Price History', '/price-history'], ['Area Ratings', '/area-ratings'], ['Investment Score', '/investment'], ['Compare Areas', '/compare']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.55)', transition: 'var(--transition)' }}
                onMouseOver={e => e.target.style.color = 'var(--green-300)'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 20, fontSize: 14, letterSpacing: '0.5px' }}>CITIES</h4>
            {CITIES.slice(0, 8).map(c => (
              <Link key={c} to={`/properties?city=${c}`} style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.55)', transition: 'var(--transition)' }}
                onMouseOver={e => e.target.style.color = 'var(--green-300)'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{c}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 20, fontSize: 14, letterSpacing: '0.5px' }}>ACCOUNT</h4>
            {[['Login', '/login'], ['Register', '/register'], ['List Property', '/list-property'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.55)', transition: 'var(--transition)' }}
                onMouseOver={e => e.target.style.color = 'var(--green-300)'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >{label}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2025 Zameen Smart Property Intelligence. All rights reserved.</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Built for India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
