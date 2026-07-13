'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileAvatar() {
  return (
    <div>
      <label
        className="
        relative
        group
        h-24
        w-24
        cursor-pointer
        "
      >
        <Avatar className="h-24 w-24 hover:scale-105 transition-transform duration-300 hover:shadow-lg">
          <AvatarImage src="/avatar.png" />
          <AvatarFallback>DN</AvatarFallback>
        </Avatar>

        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-black/50
            opacity-0
            group-hover:opacity-100
            transition
            flex
            items-center
            justify-center
            "
        >
          <span className="text-white text-xs">Change</span>
        </div>

        <input type="file" accept="image/*" className="hidden" />
      </label>
    </div>
  );
}
