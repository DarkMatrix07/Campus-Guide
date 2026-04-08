import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, Star } from 'lucide-react';
import AuthShowcase from '@/components/AuthShowcase';
import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';

const showcaseHighlights = [
  'Student-trusted reviews across food, stays, and everyday essentials.',
  'Spotlight collections that help you decide faster between classes.',
  'A calmer, cleaner way to discover what is worth your time near campus.',
];

const showcaseStats = [
  { value: '500+', label: 'spots' },
  { value: '10k+', label: 'reviews' },
  { value: '50+', label: 'campuses' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <div className="min-h-[100dvh] bg-stone-100 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <AuthShowcase
        badge="Trusted picks"
        title="Every campus favorite, organized with clarity."
        description="Campus Guide gives students a premium, low-noise way to compare places, decide faster, and head out with confidence."
        highlights={showcaseHighlights}
        stats={showcaseStats}
        footer="Built for campus life: practical recommendations, useful filters, and a visual experience that feels calm instead of cluttered."
      />

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.18),transparent_28%)]" />

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <AppLogo compact />
            </div>
            <p className="ml-auto text-sm text-slate-600">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-slate-950 transition hover:text-sky-700">
                Create account
              </Link>
            </p>
          </div>

          <Card className="rounded-[30px] border-white/80 bg-white/88 py-0 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)] backdrop-blur-sm">
            <CardContent className="space-y-8 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  <Sparkles className="size-3.5" />
                  Clean student flow
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    Welcome back
                  </h1>
                  <p className="text-sm leading-7 text-slate-600">
                    Sign in to continue exploring the most useful spots around your campus.
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-950"
                    >
                      Forgot it?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="size-4" />}
                </Button>
              </form>

              <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-stone-50/80 p-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
                  <Compass className="size-4 text-sky-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">Explore faster</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Filter the best places without digging through clutter.
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
                  <Star className="size-4 text-amber-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">Trust the signal</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    See the highest-rated picks surfaced with better context.
                  </p>
                </div>
              </div>

              <p className="text-center text-xs leading-6 text-slate-500">
                By signing in, you agree to our{' '}
                <span className="font-medium text-slate-700">Terms</span> and{' '}
                <span className="font-medium text-slate-700">Privacy Policy</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Login;
