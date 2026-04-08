import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPinned,
  Medal,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';

const rankLabels = ['#1', '#2', '#3'];

const TopRatedBusinesses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');

  useEffect(() => {
    let active = true;

    const loadTopRated = async () => {
      try {
        const response = await api.get('/businesses/top-rated');

        if (!active) {
          return;
        }

        setSections(response.data.sections || []);
        setLoadingError('');
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingError(error.response?.data?.message || 'Unable to load top-rated businesses right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTopRated();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const featuredBusinesses = useMemo(() => (
    sections
      .flatMap((section) => section.businesses || [])
      .sort((left, right) => {
        if (right.averageRating !== left.averageRating) {
          return right.averageRating - left.averageRating;
        }

        return right.reviewCount - left.reviewCount;
      })
      .slice(0, 3)
  ), [sections]);

  const totalRatedBusinesses = featuredBusinesses.length
    ? sections.reduce((count, section) => count + (section.businesses?.length || 0), 0)
    : 0;

  return (
    <DashboardShell
      user={user}
      role="student"
      roleLabel="Student"
      title="Top rated"
      description="See the strongest reviewed approved businesses, grouped by category so the best-rated options surface first."
      onLogout={handleLogout}
      headerAction={(
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="h-11 rounded-2xl border-white/80 bg-white/90 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          <ArrowLeft className="size-4" />
          Back to directory
        </Button>
      )}
    >
      {loading ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading top-rated businesses
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Aggregating average ratings across approved businesses.
              </p>
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
                Top-rated view unavailable
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{loadingError}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.35)]">
              <CardContent className="relative p-6 sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.26),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(186,230,253,0.35),transparent_38%)]" />
                <div className="relative">
                  <Badge className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 ring-1 ring-amber-100">
                    Feature 6
                  </Badge>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                    Best-reviewed businesses by category
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    Ratings are aggregated per business and ranked inside each category, so Food, Stationery, and PG
                    each surface their strongest reviewed listings.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {featuredBusinesses.slice(0, 3).map((business) => (
                      <button
                        key={business.id}
                        type="button"
                        onClick={() => navigate(`/businesses/${business.id}`)}
                        className="rounded-full border border-white bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"
                      >
                        {business.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.28)]">
              <CardContent className="p-6">
                <div className="flex size-12 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <Trophy className="size-5" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Rated listings</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{totalRatedBusinesses}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Businesses currently ranked across the category sections below.
                </p>
              </CardContent>
            </Card>
          </div>

          {sections.every((section) => (section.businesses || []).length === 0) ? (
            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="flex min-h-[320px] items-center justify-center p-8">
                <div className="max-w-xl text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <Medal className="size-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    No rated businesses yet
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Top-rated sections will populate after approved businesses start receiving student reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <Card
                  key={section.category}
                  className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.3)]"
                >
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Badge className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                          {section.category}
                        </Badge>
                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                          {section.category} top rated
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Highest average ratings among approved businesses in this category.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-stone-50 px-4 py-2 text-sm font-medium text-slate-600">
                        <Sparkles className="size-4 text-amber-500" />
                        {(section.businesses || []).length} ranked
                      </div>
                    </div>

                    {(section.businesses || []).length === 0 ? (
                      <div className="mt-6 rounded-[26px] border border-dashed border-slate-200 bg-stone-50/70 p-6">
                        <p className="text-sm font-semibold text-slate-950">No rated businesses in this category yet</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          This category will appear here once approved businesses receive student reviews.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 grid gap-5 xl:grid-cols-3">
                        {(section.businesses || []).map((business, index) => (
                          <Card
                            key={business.id}
                            className="overflow-hidden rounded-[28px] border border-slate-100 bg-stone-50/70 py-0 shadow-none"
                          >
                            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                              <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
                            </div>
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                    <Trophy className="size-3.5" />
                                    {rankLabels[index] || `#${index + 1}`}
                                  </div>
                                  <h4 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                                    {business.name}
                                  </h4>
                                  <p className="mt-2 text-sm text-slate-500">{business.category}</p>
                                </div>
                                <div className="rounded-[20px] border border-amber-200 bg-white px-3 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1 text-amber-700">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-semibold">
                                      {Number(business.averageRating || 0).toFixed(1)}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500">{business.reviewCount} reviews</p>
                                </div>
                              </div>

                              <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{business.description}</p>

                              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                <MapPinned className="size-4 text-sky-600" />
                                <span>{business.location}</span>
                              </div>

                              <div className="mt-6 border-t border-slate-200 pt-4">
                                <Button
                                  type="button"
                                  onClick={() => navigate(`/businesses/${business.id}`)}
                                  className="h-11 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                                  aria-label={`View details for ${business.name}`}
                                >
                                  View business
                                  <ArrowRight className="size-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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

export default TopRatedBusinesses;
