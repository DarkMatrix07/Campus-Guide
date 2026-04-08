import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Compass,
  LoaderCircle,
  MapPinned,
  MessageSquare,
  Search,
  Star,
  X,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let active = true;

    const loadBusinesses = async () => {
      try {
        const response = await api.get('/businesses/public');
        if (!active) return;
        setBusinesses(response.data.businesses || []);
      } catch (error) {
        if (!active) return;
        setLoadingError(error.response?.data?.message || 'Unable to load businesses right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBusinesses();
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const categories = useMemo(() => {
    const cats = [...new Set(businesses.map((b) => b.category))].sort();
    return ['All', ...cats];
  }, [businesses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return businesses.filter((b) => {
      const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
      const matchesSearch = !q
        || b.name.toLowerCase().includes(q)
        || b.category.toLowerCase().includes(q)
        || b.location.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [businesses, search, activeCategory]);

  return (
    <DashboardShell
      user={user}
      role="student"
      roleLabel="Student"
      title="Campus directory"
      description="Browse approved businesses near your campus. Click any card to read reviews and share your own."
      onLogout={handleLogout}
    >
      {loading ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading the directory
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Fetching approved businesses near your campus.</p>
            </div>
          </CardContent>
        </Card>
      ) : loadingError ? (
        <Card className="rounded-[32px] border-red-100 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[320px] items-center justify-center p-8">
            <div className="max-w-lg text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-red-50 text-red-600 ring-1 ring-red-100">
                <AlertCircle className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Directory unavailable
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{loadingError}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Search + filter bar */}
          <Card className="rounded-[28px] border-white/80 bg-white/90 py-0 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.3)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, category, or location…"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-stone-50 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-slate-950 text-white'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-500">
              {filtered.length === 0
                ? 'No businesses found'
                : `${filtered.length} ${filtered.length === 1 ? 'business' : 'businesses'} found`}
            </p>
            {(search || activeCategory !== 'All') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Business grid */}
          {filtered.length === 0 ? (
            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="flex min-h-[300px] items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <Compass className="size-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                    {businesses.length === 0 ? 'No approved businesses yet' : 'No matches found'}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {businesses.length === 0
                      ? 'Businesses appear here once an admin approves them.'
                      : 'Try a different search term or category filter.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((business) => (
                <button
                  key={business.id}
                  type="button"
                  onClick={() => navigate(`/businesses/${business.id}`)}
                  className="group text-left overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.3)] hover:shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={business.imageUrl}
                      alt={business.name}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                          {business.category}
                        </Badge>
                        <h3 className="mt-2 text-base font-semibold tracking-[-0.03em] text-slate-950 truncate">
                          {business.name}
                        </h3>
                      </div>

                      {business.averageRating > 0 && (
                        <div className="flex items-center gap-1 shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-700">
                            {business.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="mt-2.5 text-sm leading-6 text-slate-600 line-clamp-2">
                      {business.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPinned className="size-3.5 text-sky-500" />
                        {business.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <MessageSquare className="size-3.5" />
                        {business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
};

export default StudentDashboard;
