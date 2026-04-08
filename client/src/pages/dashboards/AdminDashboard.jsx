import React, { useEffect, useState } from 'react';
import { formatReviewDate as formatQueueDate } from '../../lib/formatDate';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Store,
  XCircle,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../../context/AuthContext';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [activeBusinessAction, setActiveBusinessAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadPendingBusinesses = async () => {
      setLoadingBusinesses(true);

      try {
        const response = await api.get('/businesses/pending');

        if (!active) {
          return;
        }

        setBusinesses(response.data.businesses || []);
        setLoadingError('');
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingError(error.response?.data?.message || 'Unable to load pending businesses right now.');
      } finally {
        if (active) {
          setLoadingBusinesses(false);
        }
      }
    };

    loadPendingBusinesses();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (businessId, status) => {
    setActiveBusinessAction(`${businessId}:${status}`);

    try {
      await api.patch(`/businesses/${businessId}/status`, { status });
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setLoadingError(error.response?.data?.message || 'Unable to update business status right now.');
    } finally {
      setActiveBusinessAction(null);
    }
  };

  const isInitialLoading = loadingBusinesses && businesses.length === 0;
  const hasQueue = businesses.length > 0;

  return (
    <DashboardShell
      user={user}
      role="admin"
      roleLabel="Admin"
      title="Admin workspace"
      description="Review new owner submissions, approve high-quality listings, and keep the public business directory accurate."
      onLogout={handleLogout}
    >
      {isInitialLoading ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading moderation queue
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Loading the current moderation queue.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {loadingError && (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadingError}
            </div>
          )}

          <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
                    Review queue
                  </Badge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    Pending business approvals
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    Every listing stays private until you approve it. Rejected listings remain hidden from the public
                    business feed.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-stone-50/80 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pending now</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{businesses.length}</p>
                </div>
              </div>

              {hasQueue ? (
                <div className="mt-8 grid gap-5">
                  {businesses.map((business) => {
                    const approving = activeBusinessAction === `${business.id}:approved`;
                    const rejecting = activeBusinessAction === `${business.id}:rejected`;
                    const isUpdating = approving || rejecting;

                    return (
                      <div
                        key={business.id}
                        className="grid gap-6 rounded-[30px] border border-slate-200 bg-stone-50/80 p-5 lg:grid-cols-[220px_1fr]"
                      >
                        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                          <div className="aspect-[4/3] bg-slate-100">
                            <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                                  {business.name}
                                </h3>
                                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                  <Clock3 className="size-3.5" />
                                  Pending
                                </span>
                              </div>
                              <p className="text-sm leading-7 text-slate-600">{business.description}</p>
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Submitted
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-950">
                                {formatQueueDate(business.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                <Store className="size-4" />
                                Category
                              </div>
                              <p className="mt-3 text-sm font-semibold text-slate-950">{business.category}</p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                <MapPinned className="size-4" />
                                Location
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-700">{business.location}</p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                <Phone className="size-4" />
                                Contact
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-700">{business.contact}</p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                <Mail className="size-4" />
                                Owner
                              </div>
                              <p className="mt-3 text-sm font-semibold text-slate-950">
                                {business.owner?.name || 'Unknown owner'}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">{business.owner?.email || 'No email'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                            <Button
                              type="button"
                              disabled={isUpdating}
                              aria-label={`Approve ${business.name}`}
                              onClick={() => handleStatusUpdate(business.id, 'approved')}
                              className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                            >
                              {approving ? (
                                <>
                                  <LoaderCircle className="size-4 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-4" />
                                  Approve
                                </>
                              )}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={isUpdating}
                              aria-label={`Reject ${business.name}`}
                              onClick={() => handleStatusUpdate(business.id, 'rejected')}
                              className="h-11 rounded-2xl border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50 hover:text-red-800"
                            >
                              {rejecting ? (
                                <>
                                  <LoaderCircle className="size-4 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="size-4" />
                                  Reject
                                </>
                              )}
                            </Button>

                            <p className="text-sm text-slate-500">
                              Approving makes the listing public. Rejecting keeps it hidden.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-[30px] border border-dashed border-slate-200 bg-stone-50/70 p-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Queue is clear
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">No pending businesses right now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {loadingBusinesses && hasQueue && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle className="size-4 animate-spin" />
              Refreshing the moderation queue...
            </div>
          )}

          {!loadingError && hasQueue && (
            <div className="rounded-[24px] border border-slate-200 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-600">
              Approved businesses are returned by the public listings endpoint immediately after moderation, so the
              student-facing business directory can consume them without extra admin steps.
            </div>
          )}

          {loadingError && hasQueue && (
            <Card className="rounded-[28px] border-red-100 bg-white/90 py-0 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Last action needs another try</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    The queue is still visible below. Retry the approve or reject action once the server is available.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;
