'use client';

import { useState } from 'react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { appToast } from '@/lib/toast';

import PersonalInfoCardSkeleton from './PersonalInfoCardSkeleton';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import { useAuthContext } from '@/contexts/auth.context';

export default function PersonalInfoCard() {
  const { user, loading } = useAuthContext();

  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    timezone: '',
  });

  const handleEdit = () => {
    setForm({
      email: user?.email ?? '',
      fullName: user?.fullName ?? '',
      timezone: user?.timezone ?? '',
    });

    setIsEditing(true);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        email: form.email,
        fullName: form.fullName,
        timezone: form.timezone,
      });

      appToast.success('Profile updated successfully');

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      appToast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      timezone: user?.timezone ?? '',
    });

    setIsEditing(false);
  };

  if (loading) {
    return <PersonalInfoCardSkeleton />;
  }

  return (
    <Card className="shadow-lg dark:bg-slate-900 mx-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>

        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 w-20 rounded-2xl" onClick={handleCancel}>
              Cancel
            </Button>

            <Button className="h-10 w-20 rounded-2xl" onClick={handleSave}>
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="h-10 w-20 rounded-2xl" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Full Name */}
        <div>
          <p className="mb-2 text-sm font-semibold">Full Name</p>

          {isEditing ? (
            <Input
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          ) : (
            <p>{user?.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="mb-2 text-sm font-semibold">Email</p>

          {isEditing ? <Input value={form.email} disabled /> : <p>{user?.email}</p>}
        </div>

        {/* Timezone */}
        <div>
          <p className="mb-2 text-sm font-semibold">Timezone</p>

          {isEditing ? (
            <Input
              value={form.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            />
          ) : (
            <p>{user?.timezone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
