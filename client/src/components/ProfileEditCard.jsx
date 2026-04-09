import React, { useState } from 'react';
import { CheckCircle2, LoaderCircle, X } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';

const ProfileEditCard = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await api.patch('/auth/profile', payload);
      updateUser(res.data.user);
      setSuccess(true);
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.3)]">
      <CardContent className="p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-stone-50 text-slate-500 hover:bg-stone-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />
            Profile updated.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-medium text-slate-700">Name</Label>
            <Input
              id="profile-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              className="h-11 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-sky-300 focus-visible:ring-sky-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-sm font-medium text-slate-700">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              className="h-11 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-sky-300 focus-visible:ring-sky-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-new-password" className="text-sm font-medium text-slate-700">
              New password <span className="font-normal text-slate-400">(optional)</span>
            </Label>
            <Input
              id="profile-new-password"
              type="password"
              value={form.newPassword}
              onChange={(e) => updateField('newPassword', e.target.value)}
              placeholder="Leave blank to keep current"
              className="h-11 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-sky-300 focus-visible:ring-sky-100"
            />
          </div>

          {form.newPassword && (
            <div className="space-y-2">
              <Label htmlFor="profile-confirm-password" className="text-sm font-medium text-slate-700">
                Confirm new password
              </Label>
              <Input
                id="profile-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-sky-300 focus-visible:ring-sky-100"
              />
            </div>
          )}

          {form.newPassword && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profile-current-password" className="text-sm font-medium text-slate-700">
                Current password <span className="font-normal text-slate-400">(required to change password)</span>
              </Label>
              <Input
                id="profile-current-password"
                type="password"
                value={form.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm focus-visible:border-sky-300 focus-visible:ring-sky-100"
              />
            </div>
          )}

          <div className="flex gap-3 sm:col-span-2">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {saving ? <><LoaderCircle className="size-4 animate-spin" />Saving...</> : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-2xl border-slate-200 px-6 text-sm font-semibold text-slate-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditCard;
