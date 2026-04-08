import React, { useEffect, useState } from 'react';
import { formatReviewDate } from '../lib/formatDate';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  MapPinned,
  MessageSquareText,
  Phone,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import api from '@/api/axios';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../context/AuthContext';


const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const BusinessDetail = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeReaction, setActiveReaction] = useState('');

  useEffect(() => {
    let active = true;

    const loadBusiness = async () => {
      try {
        const response = await api.get(`/businesses/public/${businessId}`);

        if (!active) {
          return;
        }

        setBusiness(response.data.business);
        setLoadingError('');
        setSelectedImageIndex(0);
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingError(error.response?.data?.message || 'Unable to load this business right now.');
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
  }, [businessId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError('');

    const trimmedComment = reviewComment.trim();
    if (!reviewRating || !trimmedComment) {
      setReviewError('Choose a star rating and write a short review before submitting.');
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await api.post(`/businesses/${businessId}/reviews`, {
        rating: reviewRating,
        comment: trimmedComment,
      });

      setBusiness(response.data.business);
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Unable to submit your review right now.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReaction = async (reviewId, reaction) => {
    setActiveReaction(`${reviewId}:${reaction}`);

    try {
      const response = await api.patch(`/businesses/${businessId}/reviews/${reviewId}/reaction`, { reaction });
      setBusiness(response.data.business);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Unable to update your reaction right now.');
    } finally {
      setActiveReaction('');
    }
  };

  const images = business?.images?.length ? business.images : business?.imageUrl ? [business.imageUrl] : [];
  const activeImage = images[selectedImageIndex] || business?.imageUrl;

  return (
    <DashboardShell
      user={user}
      role="student"
      roleLabel="Student"
      title={business?.name || 'Business details'}
      description={business
        ? `${business.directoryCategory} listing in ${business.location}. Read public feedback before you visit.`
        : 'Loading the approved business profile and public reviews.'}
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
      {loadingBusiness ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
          <CardContent className="flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Loading business details
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Fetching the approved listing and public reviews.</p>
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
                Business details unavailable
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{loadingError}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                      {business.directoryCategory}
                    </Badge>
                    <span className="rounded-full border border-slate-200 bg-stone-50 px-3 py-1 text-xs font-medium text-slate-500">
                      {business.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Approved listing
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <MapPinned className="size-4 text-sky-600" />
                        {business.location}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Phone className="size-4 text-sky-600" />
                        {business.contact}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-slate-600">{business.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-stone-50/80">
                    <div className="aspect-[4/3] bg-slate-100">
                      <img src={activeImage} alt={business.name} className="h-full w-full object-cover" />
                    </div>
                  </div>

                  {images.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((image, index) => {
                        const isActive = index === selectedImageIndex;

                        return (
                          <button
                            key={image}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`overflow-hidden rounded-[20px] border ${
                              isActive ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200'
                            }`}
                            aria-label={`View image ${index + 1}`}
                          >
                            <div className="aspect-[4/3] bg-slate-100">
                              <img src={image} alt={`${business.name} ${index + 1}`} className="h-full w-full object-cover" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_80px_-50px_rgba(15,23,42,0.8)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Store rating</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Star className="size-5 fill-amber-300 text-amber-300" />
                      <p className="text-3xl font-semibold tracking-tight">{business.averageRating.toFixed(1)}</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {business.averageRating.toFixed(1)} average rating
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Public reviews</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{business.reviewCount}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      {pluralize(business.reviewCount, 'review', 'reviews')} visible to students
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <Star className="size-5" />
                  </div>
                  <div>
                    <Badge className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Your review
                    </Badge>
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      Add your rating
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Share a star rating and a short written review so other students can judge the business faster.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  {business.viewerHasReviewed ? (
                    <div className="rounded-[26px] border border-sky-100 bg-sky-50/80 p-5">
                      <p className="text-sm font-semibold text-slate-950">Review already submitted</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        You already shared a review for this business.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                      {reviewError && (
                        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {reviewError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Star rating</Label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const isActive = value === reviewRating;

                            return (
                              <Button
                                key={value}
                                type="button"
                                variant="outline"
                                aria-label={`Rate ${value} stars`}
                                onClick={() => setReviewRating(value)}
                                className={`h-11 rounded-2xl px-4 text-sm ${
                                  isActive
                                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-stone-100'
                                }`}
                              >
                                <Star className={`size-4 ${isActive ? 'fill-amber-400 text-amber-400' : ''}`} />
                                {value}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business-review" className="text-sm font-medium text-slate-700">
                          Write a review
                        </Label>
                        <Textarea
                          id="business-review"
                          value={reviewComment}
                          onChange={(event) => {
                            setReviewComment(event.target.value);
                            setReviewError('');
                          }}
                          placeholder="Tell other students what stood out."
                          className="min-h-32 rounded-[24px] border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:ring-sky-100"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submittingReview}
                        className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                      >
                        {submittingReview ? 'Submitting review...' : 'Submit review'}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <MessageSquareText className="size-5" />
                  </div>
                  <div>
                    <Badge className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Public reviews
                    </Badge>
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      Public reviews
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Read what students have said, then use like or dislike reactions to signal which reviews were
                      useful.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {business.reviews.length > 0 ? (
                    business.reviews.map((review) => {
                      const liking = activeReaction === `${review.id}:like`;
                      const disliking = activeReaction === `${review.id}:dislike`;

                      return (
                        <div key={review.id} className="rounded-[26px] border border-slate-200 bg-stone-50/80 p-5">
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

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              aria-label={`Like review ${review.comment}`}
                              disabled={liking || disliking}
                              onClick={() => handleReaction(review.id, 'like')}
                              className={`h-10 rounded-full px-4 text-sm ${
                                review.viewerReaction === 'like'
                                  ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-stone-100'
                              }`}
                            >
                              {liking ? <LoaderCircle className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
                              Like
                            </Button>

                            <span className="text-sm text-slate-500">{pluralize(review.likeCount, 'like', 'likes')}</span>

                            <Button
                              type="button"
                              variant="outline"
                              aria-label={`Dislike comment ${review.comment}`}
                              disabled={liking || disliking}
                              onClick={() => handleReaction(review.id, 'dislike')}
                              className={`h-10 rounded-full px-4 text-sm ${
                                review.viewerReaction === 'dislike'
                                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-stone-100'
                              }`}
                            >
                              {disliking ? <LoaderCircle className="size-4 animate-spin" /> : <ThumbsDown className="size-4" />}
                              Dislike
                            </Button>

                            <span className="text-sm text-slate-500">
                              {pluralize(review.dislikeCount, 'dislike', 'dislikes')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[26px] border border-dashed border-slate-200 bg-stone-50/70 p-6">
                      <p className="text-sm font-semibold text-slate-950">No public reviews yet</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Be the first student to add a rating and written review for this business.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default BusinessDetail;
