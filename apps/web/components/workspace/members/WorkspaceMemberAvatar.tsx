// WorkspaceMemberAvatar.tsx
import Image from 'next/image';

export default function WorkspaceMemberAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  return (
    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-gradient-to-br
        from-blue-500
        to-violet-600
        text-sm
        font-semibold
        text-white
      "
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={40}
          height={40}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>
          <Image
            src="/avatars/default-avt.jpg"
            alt={name}
            width={40}
            height={40}
            className="h-full w-full rounded-full object-cover"
          />
        </span>
      )}
    </div>
  );
}
