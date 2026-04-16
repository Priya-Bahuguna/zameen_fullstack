import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '13px 16px', border: '1.5px solid var(--gray-300)', borderRadius: 10,
    fontSize: 15, width: '100%', outline: 'none', transition: 'var(--transition)',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--green-700)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 28, color: 'white' }}>Z</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Sign in to your Zameen account</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS</label>
              <input
                style={inputStyle} type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>PASSWORD</label>
              <input
                style={inputStyle} type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}>
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--green-700)', fontWeight: 700 }}>Create one →</Link>
            </p>
          </div>

          <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginTop: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 8 }}>DEMO ACCOUNTS</p>
            {[
              { label: 'Admin', email: 'admin@zameen.com', pass: 'admin123' },
              { label: 'Seller', email: 'seller@zameen.com', pass: 'seller123' },
              { label: 'Buyer', email: 'buyer@zameen.com', pass: 'buyer123' },
            ].map(d => (
              <button key={d.label} onClick={() => setForm({ email: d.email, password: d.pass })}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: 6, border: 'none', background: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--green-700)', fontWeight: 600 }}>
                {d.label}: {d.email} / {d.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
