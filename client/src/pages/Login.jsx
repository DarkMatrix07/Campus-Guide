import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const spots = [
  { emoji: '🍱', name: "Mama's Kitchen", category: 'Food', rating: '4.9' },
  { emoji: '📚', name: 'Campus Stationery', category: 'Stationery', rating: '4.7' },
  { emoji: '🏠', name: 'Green PG', category: 'PG & Stays', rating: '4.8' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-zinc-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-600 blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-[320px] h-[320px] rounded-full bg-violet-600 blur-[110px] opacity-10 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">Campus Guide</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10">
          <h2 className="text-white text-[2.4rem] font-bold tracking-tight leading-[1.15] mb-3">
            Discover the best<br />spots around<br />
            <span className="text-blue-400">your campus.</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-[38ch]">
            Student-powered reviews for food, stationery, PG, and everything in between.
          </p>

          <div className="space-y-3">
            {spots.map(({ emoji, name, category, rating }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-2xl shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 text-sm font-semibold truncate">{name}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-zinc-300 text-xs font-semibold">{rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="relative z-10 flex items-center gap-9">
          {[
            ['500+', 'Businesses'],
            ['10k+', 'Reviews'],
            ['50+', 'Colleges']
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-white font-bold text-xl tracking-tight leading-none">{num}</p>
              <p className="text-zinc-500 text-[11px] mt-1.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-zinc-50">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900 text-sm">Campus Guide</span>
          </div>
          <div className="ml-auto text-sm text-zinc-500 hidden lg:block" />
          <div className="ml-auto text-sm text-zinc-500 lg:ml-0">
            No account?{' '}
            <Link to="/signup" className="text-zinc-900 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h1>
              <p className="text-sm text-zinc-500 mt-1">Sign in to your Campus Guide account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">Email address</Label>
                <Input
                  id="email" type="email" name="email" placeholder="you@college.edu"
                  value={form.email} onChange={handleChange} required
                  className="h-10 bg-white border-zinc-200 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">Password</Label>
                <Input
                  id="password" type="password" name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required
                  className="h-10 bg-white border-zinc-200 text-sm"
                />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-10 mt-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm gap-2 transition-colors">
                {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
              <p className="text-xs text-zinc-400">
                By signing in you agree to our{' '}
                <span className="text-zinc-600 underline cursor-pointer hover:text-zinc-900">Terms</span> and{' '}
                <span className="text-zinc-600 underline cursor-pointer hover:text-zinc-900">Privacy Policy</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;

