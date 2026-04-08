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

    if (!form.image) {
      setFormError('Please upload a storefront image before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
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

  const shellTitle = business
    ? 'Your business'
    : 'Complete your business setup';

  const shellDescription = business
    ? 'Track your listing status, store rating, and public student reviews from one calm owner workspace.'
    : 'Register your business once to unlock your owner dashboard on future logins.';

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
    >
      {loadingBusiness ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Checking your business workspace
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Loading your registration status and store details.
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
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                      Submitted listing
                    </Badge>
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
                        Your setup is complete. This owner view now keeps your registration status, store rating, and
                        public student reviews in one place.
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
                          {averageRating.toFixed(1)} average rating
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
                  <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Public reviews
                  </Badge>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Public reviews
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Student names stay hidden here. Only the public review text and rating are shown in the owner
                    workspace.
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
                      Public reviews will appear here once students start sharing feedback. Reviewer names stay hidden.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                      The first image becomes the main storefront photo shown back to you after setup.
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
                    <Label htmlFor="business-category" className="text-sm font-medium text-slate-700">
                      Category
                    </Label>
                    <Input
                      id="business-category"
                      value={form.category}
                      onChange={(event) => updateField('category', event.target.value)}
                      placeholder="Cafe"
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-100"
                    />
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
                        Your business is saved as pending, and this workspace becomes your status and reviews view.
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
