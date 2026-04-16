import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';
import ZameenLogo from './ZameenLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/ai-estimator', label: 'AI Estimator' },
    { to: '/price-history', label: 'Price History' },
    { to: '/area-ratings', label: 'Area Ratings' },
    { to: '/investment', label: 'Investment' },
    { to: '/compare', label: 'Compare' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" style={{ textDecoration: 'none' }}>
          <ZameenLogo size={36} textColor="var(--gray-900)" />
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: 13, padding: '8px 16px' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link" style={{ fontWeight: 600 }}>Login</Link>
              <Link to="/register" className="btn btn-outline" style={{ fontSize: 13, padding: '8px 16px' }}>Register</Link>
            </>
          )}
          {(!user || user.role === 'seller' || user.role === 'admin') && (
            <Link to="/list-property" className="btn btn-primary" style={{ fontSize: 13 }}>
              + List Property
            </Link>
          )}
          <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
