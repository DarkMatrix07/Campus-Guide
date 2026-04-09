import React, { useEffect, useState } from 'react';
import { formatReviewDate } from '../../lib/formatDate';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPinned,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Upload,
  XCircle,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import ProfileEditCard from '@/components/ProfileEditCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  category: '',
  directoryCategory: '',
  location: '',
  description: '',
  contact: '',
  image: null,
};

const formatStatusLabel = (status) => {
  if (!status) {
    return 'Pending review';
  }

  return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
};


const businessStatusContent = {
  pending: {
    title: 'Pending review',
    description: 'Your listing is saved in pending status until the admin review is complete.',
    highlight: 'Waiting for approval',
    containerClassName: 'border-amber-100 bg-amber-50/80',
    iconWrapperClassName: 'bg-white text-amber-600 ring-1 ring-amber-100',
    icon: ShieldCheck,
  },
  approved: {
    title: 'Approved and public',
    description: 'Your business is now visible in the public business listings.',
    highlight: 'Live in directory',
    containerClassName: 'border-emerald-100 bg-emerald-50/80',
    iconWrapperClassName: 'bg-white text-emerald-600 ring-1 ring-emerald-100',
    icon: CheckCircle2,
  },
  rejected: {
    title: 'Rejected for now',
    description: 'This listing is not public right now. It stays hidden until a future resubmission flow is added.',
    highlight: 'Needs review changes',
    containerClassName: 'border-red-100 bg-red-50/80',
    iconWrapperClassName: 'bg-white text-red-600 ring-1 ring-red-100',
    icon: XCircle,
  },
};

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;

    const loadBusiness = async () => {
      try {
        const response = await api.get('/businesses/mine');

        if (!active) {
          return;
        }

        setBusiness(response.data.business);
      } catch (error) {
        if (!active) {
          return;
        }

        if (error.response?.status === 404) {
          setBusiness(null);
          setLoadingError('');
        } else {
          setLoadingError(error.response?.data?.message || 'Unable to load your business right now.');
        }
      } finally {
        if (active) {
          setLoadingBusiness(false);
        }
      }
    };

    loadBusiness();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.directoryCategory) {
      setFormError('Please select a directory category.');
      return;
    }

    if (!form.image) {
      setFormError('Please upload a storefront image before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category || form.directoryCategory);
      formData.append('directoryCategory', form.directoryCategory);
      formData.append('location', form.location);
      formData.append('description', form.description);
      formData.append('contact', form.contact);
      formData.append('image', form.image);

      const response = await api.post('/businesses', formData);
      setBusiness(response.data.business);
      setForm(initialForm);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Business submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditMode = () => {
    setEditForm({
      name: business.name || '',
      category: business.category || '',
      directoryCategory: business.directoryCategory || '',
      location: business.location || '',
      description: business.description || '',
      contact: business.contact || '',
      image: null,
    });
    setEditError('');
    setEditMode(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditError('');

    if (!editForm.directoryCategory) {
      setEditError('Please select a directory category.');
      return;
    }

    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('category', editForm.category || editForm.directoryCategory);
      formData.append('directoryCategory', editForm.directoryCategory);
      formData.append('location', editForm.location);
      formData.append('description', editForm.description);
      formData.append('contact', editForm.contact);
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const response = await api.put('/businesses/mine', formData);
      setBusiness(response.data.business);
      setEditMode(false);
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update business.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const shellTitle = business
    ? 'Your business'
    : 'Complete your business setup';

  const shellDescription = business
    ? 'Your listing status, store rating, and student reviews — all in one place.'
    : 'Register your business to get listed in the campus directory.';

  const statusContent = business
    ? businessStatusContent[business.status] || businessStatusContent.pending
    : businessStatusContent.pending;
  const StatusIcon = statusContent.icon;
  const reviewCount = business?.reviewCount || 0;
  const averageRating = Number(business?.averageRating || 0);
  const reviews = business?.reviews || [];

  return (
    <DashboardShell
      user={user}
      role="owner"
      roleLabel="Owner"
      title={shellTitle}
      description={shellDescription}
      onLogout={handleLogout}
      onEditProfile={() => setShowProfileEdit((v) => !v)}
    >
      {loadingBusiness ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading your business
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Fetching your listing details...
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
                Business workspace unavailable
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{loadingError}</p>
            </div>
          </CardContent>
        </Card>
      ) : business ? (
        <div className="space-y-6">

          {showProfileEdit && (
            <ProfileEditCard onClose={() => setShowProfileEdit(false)} />
          )}

          {editMode ? (
            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Edit listing</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="h-9 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </Button>
                </div>

                {editError && (
                  <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {editError}
                  </div>
                )}

                <form onSubmit={handleEditSubmit} noValidate className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Business name</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        required
                        className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-amber-300 focus-visible:ring-amber-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-directory-category" className="text-sm font-medium text-slate-700">Directory category</Label>
                      <select
                        id="edit-directory-category"
                        value={editForm.directoryCategory}
                        onChange={(e) => setEditForm((p) => ({ ...p, directoryCategory: e.target.value }))}
                        required
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 focus:border-amber-300 focus:outline-none focus:ring-3 focus:ring-amber-100"
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-location" className="text-sm font-medium text-slate-700">Location</Label>
                      <Input
                        id="edit-location"
                        value={editForm.location}
                        onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                        required
                        className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-amber-300 focus-visible:ring-amber-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      required
                      className="min-h-32 rounded-[24px] border-slate-200 bg-stone-50 px-4 py-3 text-sm focus-visible:border-amber-300 focus-visible:ring-amber-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-contact" className="text-sm font-medium text-slate-700">Contact</Label>
                      <Input
                        id="edit-contact"
                        value={editForm.contact}
                        onChange={(e) => setEditForm((p) => ({ ...p, contact: e.target.value }))}
                        required
                        className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-amber-300 focus-visible:ring-amber-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-image" className="text-sm font-medium text-slate-700">
                        New image <span className="font-normal text-slate-400">(optional)</span>
                      </Label>
                      <input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
                        className="flex h-12 w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 focus-visible:border-amber-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-100"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={editSubmitting}
                    className="h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                  >
                    {editSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                        Submitted listing
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openEditMode}
                        className="h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-stone-100"
                      >
                        Edit listing
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                          {business.name}
                        </h2>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                          {formatStatusLabel(business.status)}
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-slate-600">
                        Your business is registered. Check the status below and read what students are saying.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Business name</p>
                      <p className="mt-3 text-lg font-semibold text-slate-950">{business.name}</p>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Category</p>
                      <p className="mt-3 text-lg font-semibold text-slate-950">{business.category}</p>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <MapPinned className="size-4" />
                        Location
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{business.location}</p>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Phone className="size-4" />
                        Contact
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{business.contact}</p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-stone-50/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Description</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{business.description}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-stone-50/80">
                    <div className="aspect-[4/3] bg-slate-100">
                      <img
                        src={business.imageUrl}
                        alt={business.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_80px_-50px_rgba(15,23,42,0.8)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Store rating</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                          {averageRating.toFixed(1)}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          out of 5.0
                        </p>
                      </div>
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                        <Star className="size-5 fill-current" />
                      </div>
                    </div>
                    <p className="mt-5 text-sm text-slate-300">
                      {reviewCount} public {reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>

                  <div className={`rounded-[28px] border p-5 ${statusContent.containerClassName}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex size-11 items-center justify-center rounded-2xl ${statusContent.iconWrapperClassName}`}>
                        <StatusIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          {statusContent.highlight}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{statusContent.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{statusContent.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <MessageSquareText className="size-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Student reviews
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Reviewer names are not shown to business owners.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          {Number(review.rating).toFixed(1)} rating
                        </div>
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[26px] border border-dashed border-slate-200 bg-stone-50/70 p-6">
                    <p className="text-sm font-semibold text-slate-950">No public reviews yet</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Reviews show up here once students leave feedback on your listing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.14),transparent_32%)]" />

            <div className="relative grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    One-time setup
                  </Badge>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                      Register your business
                    </h2>
                    <p className="text-sm leading-7 text-slate-600">
                      Complete this setup once. After submission, this owner dashboard will show your listing status,
                      store rating, and public reviews on future logins.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-slate-100">
                      <Store className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">Create your storefront</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Add the core business details students need before they discover your listing.
                    </p>
                  </div>
                  <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-sky-600 ring-1 ring-slate-100">
                      <ImagePlus className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">Upload one strong image</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      This photo appears on your public listing in the directory.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="grid gap-5">
                {formError && (
                  <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="business-name" className="text-sm font-medium text-slate-700">
                      Business name
                    </Label>
                    <Input
                      id="business-name"
                      value={form.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      placeholder="North Gate Cafe"
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-directory-category" className="text-sm font-medium text-slate-700">
                      Directory category
                    </Label>
                    <select
                      id="business-directory-category"
                      value={form.directoryCategory}
                      onChange={(event) => updateField('directoryCategory', event.target.value)}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 focus:border-amber-300 focus:outline-none focus:ring-3 focus:ring-amber-100"
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-location" className="text-sm font-medium text-slate-700">
                      Location
                    </Label>
                    <Input
                      id="business-location"
                      value={form.location}
                      onChange={(event) => updateField('location', event.target.value)}
                      placeholder="North Gate, Block A"
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-description" className="text-sm font-medium text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="business-description"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Tell students what makes your business worth visiting."
                    required
                    className="min-h-32 rounded-[24px] border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business-contact" className="text-sm font-medium text-slate-700">
                      Contact
                    </Label>
                    <Input
                      id="business-contact"
                      value={form.contact}
                      onChange={(event) => updateField('contact', event.target.value)}
                      placeholder="+91 99999 00000"
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-image" className="text-sm font-medium text-slate-700">
                      Storefront image
                    </Label>
                    <input
                      id="business-image"
                      type="file"
                      accept="image/*"
                      onChange={(event) => updateField('image', event.target.files?.[0] || null)}
                      required
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 focus-visible:border-amber-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-100"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-stone-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-slate-100">
                      <Upload className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">After submission</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Your listing goes into a pending state until an admin approves it.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                >
                  {submitting ? 'Submitting business...' : 'Submit business'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
};

export default OwnerDashboard;
