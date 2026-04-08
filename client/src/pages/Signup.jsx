import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, ShieldCheck, Store } from 'lucide-react';
import AuthShowcase from '@/components/AuthShowcase';
import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    value: 'student',
    label: 'Student',
    description: 'Browse top campus spots and share reviews.',
    icon: GraduationCap,
  },
  {
    value: 'owner',
    label: 'Shop Owner',
    description: 'List your business and reach students nearby.',
    icon: Store,
  },
];

const showcaseHighlights = [
  'A cleaner onboarding flow for both students and local businesses.',
  'Role-aware experiences with the same premium visual language.',
  'Simple, focused forms that feel polished on mobile and desktop.',
];

const showcaseStats = [
  { value: '2', label: 'roles' },
  { value: '1', label: 'platform' },
  { value: 'Always', label: 'potential' },
];

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-[100dvh] bg-stone-100 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <AuthShowcase
        badge="Role-aware onboarding"
        title="A premium sign-up flow for every campus contributor."
        description="Choose your role, create your account, and step into a cleaner Campus Guide experience that feels consistent from the first screen onward."
        highlights={showcaseHighlights}
        stats={showcaseStats}
        footer="The redesign keeps the form practical while giving the product stronger hierarchy, calmer surfaces, and a more modern first impression."
      />

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.18),transparent_28%)]" />

        <div className="relative z-10 w-full max-w-lg space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <AppLogo compact />
            </div>
            <p className="ml-auto text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-950 transition hover:text-sky-700">
                Sign in
              </Link>
            </p>
          </div>

          <Card className="rounded-[30px] border-white/80 bg-white/90 py-0 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)] backdrop-blur-sm">
            <CardContent className="space-y-8 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  <ShieldCheck className="size-3.5" />
                  Consistent onboarding
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    Create your account
                  </h1>
                  <p className="text-sm leading-7 text-slate-600">
                    Choose how you use Campus Guide and start with a polished, low-friction setup.
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">I am joining as</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roles.map(({ value, label, description, icon: Icon }) => {
                      const selected = form.role === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField('role', value)}
                          className={cn(
                            'group relative flex min-h-32 flex-col rounded-[24px] border px-4 py-4 text-left transition-all',
                            selected
                              ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                              : 'border-slate-200 bg-stone-50/80 text-slate-700 hover:border-slate-300 hover:bg-white'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-11 items-center justify-center rounded-2xl transition-colors',
                              selected ? 'bg-white/12 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="mt-4 text-sm font-semibold">{label}</span>
                          <span className={cn('mt-2 text-xs leading-6', selected ? 'text-slate-300' : 'text-slate-500')}>
                            {description}
                          </span>
                          {selected && <span className="absolute right-4 top-4 size-2.5 rounded-full bg-sky-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Aarav Sharma"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  />
                </div>

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
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    required
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-sky-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                  {!loading && <ArrowRight className="size-4" />}
                </Button>
              </form>

              <p className="text-center text-xs leading-6 text-slate-500">
                By signing up, you agree to our{' '}
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

export default Signup;
