import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Star, Search, MessageSquare, TrendingUp, ChevronRight, LogOut } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const categories = [
  { label: 'Food & Canteens', count: '48 places', icon: '🍱', bg: '#fff7ed', border: '#fed7aa' },
  { label: 'Stationery', count: '23 places', icon: '📚', bg: '#eff6ff', border: '#bfdbfe' },
  { label: 'PG & Stays', count: '31 places', icon: '🏠', bg: '#f0fdf4', border: '#bbf7d0' },
];

const topSpots = [
  { name: "Mama's Kitchen", category: 'Food', rating: 4.9, reviews: 128 },
  { name: 'Campus Stationery', category: 'Stationery', rating: 4.7, reviews: 64 },
  { name: 'Green PG', category: 'PG', rating: 4.8, reviews: 92 },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#f8fafc' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.02em' }}>Campus Guide</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>{user?.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 999, padding: '2px 8px' }}>Student</span>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 24px' }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Find the best spots around your campus</p>
        </motion.div>

        {/* Search */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.06 }} style={{ marginBottom: 24, position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search cafes, stationery, PG..."
            style={{ width: '100%', height: 44, paddingLeft: 42, paddingRight: 16, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          />
        </motion.div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {/* Categories */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.1 }}
            style={{ gridColumn: 'span 2', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Browse Categories</h2>
              <button style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {categories.map(cat => (
                <button key={cat.label}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 14px', borderRadius: 12, backgroundColor: cat.bg, border: `1px solid ${cat.border}`, cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <span style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{cat.count}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* My Reviews */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.14 }}
            style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div>
              <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <MessageSquare size={17} color="#8b5cf6" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>My Reviews</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Reviews you've written</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0 }}>0</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>reviews submitted</p>
              <button style={{ marginTop: 14, width: '100%', height: 34, borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: 12, fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                Write a review <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>

          {/* Top Rated */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.18 }}
            style={{ gridColumn: 'span 2', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={15} color="#f59e0b" />
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Top Rated This Week</h2>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div>
              {topSpots.map((spot, i) => (
                <div key={spot.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < topSpots.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', width: 16 }}>#{i + 1}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{spot.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{spot.category} · {spot.reviews} reviews</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{spot.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dark featured card */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.22 }}
            style={{ backgroundColor: '#0f172a', borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', backgroundColor: 'rgba(251,191,36,0.1)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Star size={17} color="#fbbf24" fill="#fbbf24" />
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>Top Rated</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Best places near you</p>
            </div>
            <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>4.9</p>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>avg. top spot rating</p>
              <button style={{ marginTop: 14, width: '100%', height: 34, borderRadius: 8, backgroundColor: '#fff', border: 'none', fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                Explore now <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
