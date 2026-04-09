import React, { useEffect, useState } from 'react';
import { formatReviewDate as formatQueueDate } from '../../lib/formatDate';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  EyeOff,
  Eye,
  LoaderCircle,
  Mail,
  MapPinned,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'approvals', label: 'Approvals' },
  { id: 'categories', label: 'Categories' },
  { id: 'businesses', label: 'Businesses' },
  { id: 'users', label: 'Users' },
  { id: 'reviews', label: 'Reviews' },
];

const roleBadgeClass = {
  student: 'border-sky-200 bg-sky-50 text-sky-700',
  owner: 'border-amber-200 bg-amber-50 text-amber-700',
  admin: 'border-violet-200 bg-violet-50 text-violet-700',
};

// ── Approvals Tab ─────────────────────────────────────────────────────────────

const ApprovalsTab = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.get('/businesses/pending')
      .then((res) => {
        if (!active) return;
        setBusinesses(res.data.businesses || []);
        setError('');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load pending businesses.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [refreshKey]);

  const handleStatusUpdate = async (businessId, status) => {
    setActiveAction(`${businessId}:${status}`);
    try {
      await api.patch(`/businesses/${businessId}/status`, { status });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    } finally {
      setActiveAction(null);
    }
  };

  if (loading && businesses.length === 0) {
    return (
      <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
        <CardContent className="flex min-h-[360px] items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Loading queue</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Fetching pending submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
                Every listing stays private until you approve it.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-stone-50/80 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pending now</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{businesses.length}</p>
            </div>
          </div>

          {businesses.length > 0 ? (
            <div className="mt-8 grid gap-5">
              {businesses.map((business) => {
                const approving = activeAction === `${business.id}:approved`;
                const rejecting = activeAction === `${business.id}:rejected`;
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
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Submitted</p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {formatQueueDate(business.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          { icon: Store, label: 'Category', value: business.category },
                          { icon: MapPinned, label: 'Location', value: business.location },
                          { icon: Phone, label: 'Contact', value: business.contact },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              <Icon className="size-4" />
                              {label}
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-700">{value}</p>
                          </div>
                        ))}
                        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            <Mail className="size-4" />
                            Owner
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {business.owner?.name || 'Unknown'}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{business.owner?.email || ''}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                        <Button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(business.id, 'approved')}
                          className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                        >
                          {approving ? <><LoaderCircle className="size-4 animate-spin" />Approving...</> : <><CheckCircle2 className="size-4" />Approve</>}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(business.id, 'rejected')}
                          className="h-11 rounded-2xl border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          {rejecting ? <><LoaderCircle className="size-4 animate-spin" />Rejecting...</> : <><XCircle className="size-4" />Reject</>}
                        </Button>
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
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Queue is clear</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">No pending businesses right now.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ── Categories Tab ────────────────────────────────────────────────────────────

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then((res) => { if (active) { setCategories(res.data.categories || []); setLoading(false); } })
      .catch(() => { if (active) { setError('Unable to load categories.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError('');
    try {
      const res = await api.post('/categories', { name });
      setCategories((prev) => [...prev, res.data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
            Directory categories
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">Manage categories</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Categories appear in the owner registration dropdown and student directory filters.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleAdd} className="mb-6 flex gap-3">
          <div className="flex-1">
            <Label htmlFor="new-category" className="sr-only">New category name</Label>
            <Input
              id="new-category"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Electronics"
              maxLength={50}
              className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-violet-300 focus-visible:ring-violet-100"
            />
          </div>
          <Button
            type="submit"
            disabled={adding || !newName.trim()}
            className="h-12 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {adding ? <LoaderCircle className="size-4 animate-spin" /> : 'Add'}
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderCircle className="size-6 animate-spin text-violet-600" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No categories yet. Add one above.</p>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-stone-50/80 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    <Tag className="size-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-950">{category.name}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category.id)}
                  className="h-9 rounded-xl border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  {deletingId === category.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Businesses Tab ────────────────────────────────────────────────────────────

const statusBadgeClass = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

const BusinessesTab = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/businesses/admin/all')
      .then((res) => { if (active) { setBusinesses(res.data.businesses || []); setLoading(false); } })
      .catch(() => { if (active) { setError('Unable to load businesses.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const handleHide = async (id) => {
    setActionId(id);
    try {
      const res = await api.patch(`/businesses/${id}/hide`);
      setBusinesses((prev) =>
        prev.map((b) => b.id === id ? { ...b, hidden: res.data.hidden } : b)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update visibility.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    setConfirmDelete(null);
    try {
      await api.delete(`/businesses/${id}`);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete business.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
            All listings
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">Manage businesses</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Hide businesses from the public directory or permanently delete them.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="size-6 animate-spin text-violet-600" />
          </div>
        ) : businesses.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No businesses registered yet.</p>
        ) : (
          <div className="grid gap-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-stone-50/80 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="size-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shrink-0">
                    <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{business.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{business.category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusBadgeClass[business.status] || statusBadgeClass.pending}`}>
                        {business.status}
                      </span>
                      {business.hidden && (
                        <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionId === business.id}
                    onClick={() => handleHide(business.id)}
                    className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-stone-100"
                  >
                    {actionId === business.id ? <LoaderCircle className="size-3.5 animate-spin" /> : business.hidden ? <><Eye className="size-3.5" />Unhide</> : <><EyeOff className="size-3.5" />Hide</>}
                  </Button>

                  {confirmDelete === business.id ? (
                    <>
                      <Button
                        type="button"
                        disabled={actionId === business.id}
                        onClick={() => handleDelete(business.id)}
                        className="h-9 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Confirm delete
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmDelete(null)}
                        className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDelete(business.id)}
                      className="h-9 rounded-xl border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Users Tab ─────────────────────────────────────────────────────────────────

const UsersTab = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/admin/users')
      .then((res) => { if (active) { setUsers(res.data.users || []); setLoading(false); } })
      .catch(() => { if (active) { setError('Unable to load users.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const handleRoleChange = async (id, role) => {
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    setConfirmDelete(null);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
            User accounts
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">Manage users</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Change user roles or remove accounts. You cannot modify your own account.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="size-6 animate-spin text-violet-600" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No users found.</p>
        ) : (
          <div className="grid gap-3">
            {users.map((user) => {
              const isSelf = String(user.id) === String(currentUserId);
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-stone-50/80 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${roleBadgeClass[user.role] || ''}`}>
                        {user.role}
                      </span>
                      {isSelf && (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={user.role}
                        disabled={actionId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="student">Student</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>

                      {confirmDelete === user.id ? (
                        <>
                          <Button
                            type="button"
                            disabled={actionId === user.id}
                            onClick={() => handleDelete(user.id)}
                            className="h-9 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                            className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setConfirmDelete(user.id)}
                          className="h-9 rounded-xl border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Reviews Tab ───────────────────────────────────────────────────────────────

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/businesses/admin/reviews')
      .then((res) => { if (active) { setReviews(res.data.reviews || []); setLoading(false); } })
      .catch(() => { if (active) { setError('Unable to load reviews.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const handleHide = async (businessId, reviewId) => {
    const key = `${businessId}:${reviewId}`;
    setActionId(key);
    try {
      const res = await api.patch(`/businesses/${businessId}/reviews/${reviewId}/hide`);
      setReviews((prev) =>
        prev.map((r) =>
          r.businessId === businessId && r.reviewId === reviewId
            ? { ...r, hidden: res.data.hidden }
            : r
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (businessId, reviewId) => {
    const key = `${businessId}:${reviewId}`;
    setActionId(key);
    setConfirmDelete(null);
    try {
      await api.delete(`/businesses/${businessId}/reviews/${reviewId}`);
      setReviews((prev) =>
        prev.filter((r) => !(r.businessId === businessId && r.reviewId === reviewId))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <Badge className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
            Student reviews
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">Manage reviews</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Hide reviews from the public or permanently delete them.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="size-6 animate-spin text-violet-600" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No reviews yet.</p>
        ) : (
          <div className="grid gap-3">
            {reviews.map((review) => {
              const key = `${review.businessId}:${review.reviewId}`;
              const isActing = actionId === key;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-stone-50/80 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold">{review.rating}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-950">{review.businessName}</span>
                      {review.hidden && (
                        <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{review.comment}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatQueueDate(review.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isActing}
                      onClick={() => handleHide(review.businessId, review.reviewId)}
                      className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-stone-100"
                    >
                      {isActing ? <LoaderCircle className="size-3.5 animate-spin" /> : review.hidden ? <><Eye className="size-3.5" />Unhide</> : <><EyeOff className="size-3.5" />Hide</>}
                    </Button>

                    {confirmDelete === key ? (
                      <>
                        <Button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleDelete(review.businessId, review.reviewId)}
                          className="h-9 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setConfirmDelete(null)}
                          className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmDelete(key)}
                        className="h-9 rounded-xl border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── AdminDashboard Shell ──────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approvals');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardShell
      user={user}
      role="admin"
      roleLabel="Admin"
      title="Admin workspace"
      description="Manage approvals, categories, businesses, users, and reviews from one place."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex gap-1 overflow-x-auto rounded-[28px] border border-white/80 bg-white/90 p-1.5 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.15)]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 rounded-[22px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-stone-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'approvals' && <ApprovalsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'businesses' && <BusinessesTab />}
        {activeTab === 'users' && <UsersTab currentUserId={user?.id} />}
        {activeTab === 'reviews' && <ReviewsTab />}
      </div>
    </DashboardShell>
  );
};

export default AdminDashboard;
