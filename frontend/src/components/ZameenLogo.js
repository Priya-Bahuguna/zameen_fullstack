import React from 'react';

export default function ZameenLogo({ size = 38, showText = true, textColor = 'white' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Logo Icon - House with Z */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background rounded square */}
        <rect width="40" height="40" rx="10" fill="#1a6b3a"/>
        {/* House roof */}
        <path d="M20 6 L32 16 L32 16 L8 16 Z" fill="white" fillOpacity="0.95"/>
        {/* House body */}
        <rect x="11" y="16" width="18" height="16" rx="1" fill="white" fillOpacity="0.95"/>
        {/* Door */}
        <rect x="16" y="22" width="8" height="10" rx="2" fill="#1a6b3a"/>
        {/* Z letter on door */}
        <text x="20" y="30" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontSize="7" fill="white">Z</text>
        {/* Chimney */}
        <rect x="25" y="10" width="3.5" height="7" rx="0.5" fill="white" fillOpacity="0.8"/>
        {/* Windows */}
        <rect x="12" y="19" width="4" height="4" rx="1" fill="#dcfce7"/>
        <rect x="24" y="19" width="4" height="4" rx="1" fill="#dcfce7"/>
      </svg>

      {showText && (
        <div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.55,
            color: textColor,
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}>Zameen</div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.22,
            color: textColor === 'white' ? 'rgba(255,255,255,0.55)' : '#6b7280',
            letterSpacing: '0.8px',
            lineHeight: 1,
            marginTop: 2,
          }}>SMART PROPERTY INTELLIGENCE</div>
        </div>
      )}
    </div>
  );
}
