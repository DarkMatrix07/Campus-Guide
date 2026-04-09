import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  LoaderCircle,
  MapPinned,
  Search,
  Star,
  Trophy,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import ProfileEditCard from '@/components/ProfileEditCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../context/AuthContext';

const ratingFilters = [
  { label: 'All ratings', value: 0 },
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4 },
  { label: '3.0+', value: 3 },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [minimumRating, setMinimumRating] = useState(0);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [businessesRes, categoriesRes] = await Promise.all([
          api.get('/businesses/public'),
          api.get('/categories'),
        ]);

        if (!active) {
          return;
        }

        setBusinesses(businessesRes.data.businesses || []);
        setCategories(categoriesRes.data.categories || []);
        setLoadingError('');
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingError(error.response?.data?.message || 'Unable to load businesses right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredBusinesses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const directoryCategory = business.directoryCategory || business.category;
      const matchesCategory = activeCategory === 'All categories' || directoryCategory === activeCategory;
      const matchesRating = minimumRating === 0 || Number(business.averageRating || 0) >= minimumRating;
      const matchesSearch = !searchValue || [
        business.name,
        business.location,
        business.category,
        business.directoryCategory,
      ]
        .filter(Boolean)
        .some((fieldValue) => fieldValue.toLowerCase().includes(searchValue));

      return matchesCategory && matchesRating && matchesSearch;
    });
  }, [activeCategory, businesses, minimumRating, search]);

  return (
    <DashboardShell
      user={user}
      role="student"
      roleLabel="Student"
      title="Campus directory"
      description="Search and browse local businesses near your campus."
      onLogout={handleLogout}
      onEditProfile={() => setShowProfileEdit((v) => !v)}
      headerAction={(
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/top-rated')}
          className="h-11 rounded-2xl border-white/80 bg-white/90 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          <Trophy className="size-4 text-amber-500" />
          Top rated
        </Button>
      )}
    >
      {loading ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading businesses
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Fetching approved listings...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : loadingError ? (
        <Card className="rounded-[32px] border-red-100 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex items-center justify-center p-12">
            <div className="max-w-lg text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-red-50 text-red-600 ring-1 ring-red-100">
                <AlertCircle className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Could not load businesses
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{loadingError}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">

          {showProfileEdit && (
            <ProfileEditCard onClose={() => setShowProfileEdit(false)} />
          )}

          <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.3)]">
            <CardContent className="p-6 sm:p-7">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="directory-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or location..."
                    className="h-12 rounded-2xl border-slate-200 bg-stone-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:ring-sky-100"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1">
                    {['All categories', ...categories.map((c) => c.name)].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          activeCategory === category
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1">
                    {ratingFilters.map((filter) => (
                      <button
                        key={filter.label}
                        type="button"
                        onClick={() => setMinimumRating(filter.value)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          minimumRating === filter.value
                            ? 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredBusinesses.length === 0 ? (
            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="flex items-center justify-center p-12">
                <div className="max-w-xl text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <Compass className="size-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {businesses.length === 0 ? 'No businesses yet' : 'Nothing matches your filters'}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {businesses.length === 0
                      ? 'Businesses show up here once approved by an admin.'
                      : 'Try a different category, rating, or search term.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 xl:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <Card
                  key={business.id}
                  className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.3)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_32px_90px_-52px_rgba(15,23,42,0.38)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-3">
                        <Badge className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                          {business.directoryCategory || business.category}
                        </Badge>
                        <div>
                          <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{business.name}</h3>
                          <p className="mt-2 text-sm text-slate-500">{business.category}</p>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 text-amber-700">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">
                            {Number(business.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-amber-700/80">{business.reviewCount} reviews</p>
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600">{business.description}</p>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                      <MapPinned className="size-4 text-sky-600" />
                      <span>{business.location}</span>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <Button
                        type="button"
                        onClick={() => navigate(`/businesses/${business.id}`)}
                        className="h-11 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                        aria-label={`View details for ${business.name}`}
                      >
                        View details
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
};

export default StudentDashboard;
