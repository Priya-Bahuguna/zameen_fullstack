import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role });
      toast.success('Account created! Welcome to Zameen 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '13px 16px', border: '1.5px solid var(--gray-300)', borderRadius: 10,
    fontSize: 15, width: '100%', outline: 'none', transition: 'var(--transition)', fontFamily: 'inherit',
  };
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--green-700)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 28, color: 'white' }}>Z</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Join thousands making smarter property decisions</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            {/* Role Toggle */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>I AM A</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ val: 'buyer', label: '🏠 Buyer / Renter' }, { val: 'seller', label: '📋 Seller / Owner' }].map(r => (
                  <button key={r.val} type="button" onClick={() => setField('role', r.val)}
                    style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid', borderColor: form.role === r.val ? 'var(--green-700)' : 'var(--gray-300)', background: form.role === r.val ? 'var(--green-50)' : 'white', color: form.role === r.val ? 'var(--green-700)' : 'var(--gray-700)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'var(--transition)' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>FULL NAME *</label>
                <input style={inputStyle} type="text" placeholder="Rahul Sharma" required value={form.name} onChange={e => setField('name', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--green-500)'} onBlur={e => e.target.style.borderColor = 'var(--gray-300)'} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>PHONE</label>
                <input style={inputStyle} type="tel" placeholder="+91-9876543210" value={form.phone} onChange={e => setField('phone', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--green-500)'} onBlur={e => e.target.style.borderColor = 'var(--gray-300)'} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS *</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" required value={form.email} onChange={e => setField('email', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--green-500)'} onBlur={e => e.target.style.borderColor = 'var(--gray-300)'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>PASSWORD *</label>
                <input style={inputStyle} type="password" placeholder="Min 6 chars" required value={form.password} onChange={e => setField('password', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--green-500)'} onBlur={e => e.target.style.borderColor = 'var(--gray-300)'} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>CONFIRM PASSWORD *</label>
                <input style={inputStyle} type="password" placeholder="Repeat password" required value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--green-500)'} onBlur={e => e.target.style.borderColor = 'var(--gray-300)'} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green-700)', fontWeight: 700 }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
