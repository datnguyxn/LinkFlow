'use client';

import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { appToast } from '@/lib/toast';

import { useUploadAvatar } from '@/hooks/mutations/useUploadAvatar';
import { useAvatar } from '@/hooks/queries/useAvatar';
import { useMe } from '@/hooks/queries/useMe';

export default function ProfileAvatar() {
  const { data: user } = useMe();

  const inputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();

  const { data: avatarUrl } = useAvatar(user?.avatarUrl);

  const [preview, setPreview] = useState<string>();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);

    try {
      await uploadAvatar.mutateAsync(file);

      appToast.success('Upload avatar successfully');

      setPreview(undefined);
    } catch (error) {
      console.error(error);

      appToast.error('Upload avatar failed');

      setPreview(undefined);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <label
      className={`relative group h-24 w-24 ${
        uploadAvatar.isPending ? 'pointer-events-none' : 'cursor-pointer'
      }`}
    >
      <Avatar className="h-24 w-24 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
        <AvatarImage src={preview ?? avatarUrl} />

        <AvatarFallback>
          {user?.fullName
            ?.split(' ')
            .map((x) => x[0])
            .join('')
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
        {uploadAvatar.isPending ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <span className="text-xs font-medium text-white">Change</span>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </label>
  );
}
