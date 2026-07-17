'use client';

import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useUser } from '@/hooks/useUser';
import { useUserStore } from '@/stores/user.store';
import { useAuthStore } from '@/stores/auth.store';

import { appToast } from '@/lib/toast';

export default function ProfileAvatar() {
  const user = useAuthStore((s) => s.user);
  const { uploadAvatar, getAvatar } = useUser();

  const updateUser = useUserStore((s) => s.updateUser);

  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string>();

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);

    setUploading(true);

    try {
      const response = await uploadAvatar(file);

      updateUser({
        avatarUrl: response.data.data.objectKey,
      });

      appToast.success(response.data.message || 'Upload avatar successfully');

      setPreview(undefined);
    } catch (error) {
      console.error(error);

      appToast.error('Upload avatar failed');

      setPreview(undefined);
    } finally {
      await getAvatar(user!);

      e.target.value = '';

      setUploading(false);
    }
  };

  return (
    <div>
      <label
        className={`
          relative
          group
          h-24
          w-24
          ${uploading ? 'pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <Avatar
          className="
            h-24
            w-24
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:shadow-xl
          "
        >
          <AvatarImage src={preview ?? user?.avatarUrl} />

          <AvatarFallback>
            {user?.fullName
              ?.split(' ')
              .map((x) => x[0])
              .join('')
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-black/40
            opacity-0
            group-hover:opacity-100
            transition
            flex
            items-center
            justify-center
          "
        >
          {uploading ? (
            <div
              className="
                h-6
                w-6
                animate-spin
                rounded-full
                border-2
                border-white
                border-t-transparent
              "
            />
          ) : (
            <span className="text-xs font-medium text-white">Change</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
