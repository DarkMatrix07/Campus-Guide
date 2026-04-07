import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowRight, GraduationCap, Store, Check } from 'lucide-react';

const roles = [
  { value: 'student', label: 'Student', desc: 'Browse & review spots', icon: GraduationCap },
  { value: 'owner', label: 'Shop Owner', desc: 'List your business', icon: Store },
];

const perks = [
  'Browse 500+ local businesses',
  'Read real student reviews',
  'Find top-rated spots instantly',
];

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ display: 'none', width: '52%', backgroundColor: '#0a0f1a', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'space-between', padding: '48px' }}
        className="lg-left-panel">
        <style>{`@media (min-width: 1024px) { .lg-left-panel { display: flex !important; } }`}</style>

        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -60, width: 420, height: 420, borderRadius: '50%', backgroundColor: '#7c3aed', filter: 'blur(130px)', opacity: 0.12, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 320, height: 320, borderRadius: '50%', backgroundColor: '#3b82f6', filter: 'blur(110px)', opacity: 0.1, pointerEvents: 'none' }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={16} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Campus Guide</span>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{ color: '#fff', fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 12px' }}>
            Join thousands of<br />students finding<br />
            <span style={{ color: '#a78bfa' }}>the best spots.</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, marginBottom: 32, maxWidth: 320 }}>
            Whether you're looking for affordable food or listing your shop — Campus Guide connects campus communities.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map((perk, i) => (
              <motion.div key={perk}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#a78bfa" />
                </div>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ position: 'relative', zIndex: 10, color: '#334155', fontSize: 12 }}>
          Trusted by students at 50+ colleges across India
        </motion.p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="lg-logo-hidden">
            <style>{`@media (min-width: 1024px) { .lg-logo-hidden { display: none !important; } }`}</style>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Campus Guide</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Create your account</h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Join the campus community today</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 18, padding: '12px 14px', fontSize: 13, color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Role selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>I am a...</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {roles.map(({ value, label, desc, icon: Icon }) => {
                    const selected = form.role === value;
                    return (
                      <button key={value} type="button"
                        onClick={() => setForm({ ...form, role: value })}
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '14px 14px', borderRadius: 12, border: `2px solid ${selected ? '#0f172a' : '#e2e8f0'}`, backgroundColor: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: selected ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, transition: 'background-color 0.15s' }}>
                          <Icon size={14} color={selected ? '#fff' : '#94a3b8'} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: selected ? '#0f172a' : '#475569' }}>{label}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{desc}</span>
                        {selected && (
                          <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0f172a' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full name</label>
                <input
                  type="text" name="name" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                  style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${focused === 'name' ? '#3b82f6' : '#e2e8f0'}`, backgroundColor: '#fff', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
                <input
                  type="email" name="email" placeholder="you@college.edu"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${focused === 'email' ? '#3b82f6' : '#e2e8f0'}`, backgroundColor: '#fff', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
                <input
                  type="password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${focused === 'password' ? '#3b82f6' : '#e2e8f0'}`, backgroundColor: '#fff', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: loading ? '#64748b' : '#0f172a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, transition: 'background-color 0.15s' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#0f172a'; }}>
                {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                By signing up you agree to our{' '}
                <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span> and{' '}
                <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
