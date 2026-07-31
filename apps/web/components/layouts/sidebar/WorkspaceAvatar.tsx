import Image from 'next/image';

import { Building2 } from 'lucide-react';

import { Workspace, WorkspaceDetail } from '@/types/workspace.type';

interface WorkspaceAvatarProps {
  workspace: Workspace | WorkspaceDetail | null;
  size?: 'small' | 'large';
  active?: boolean;
}

export default function WorkspaceAvatar({
  workspace,
  size = 'small',
  active = false,
}: WorkspaceAvatarProps) {
  const sizeClass =
    size === 'large'
      ? 'h-10 w-10 rounded-xl text-sm'
      : 'h-10 w-10 rounded-xl text-sm';

  if (!workspace) {
    return (
      <div
        className={`
          flex
          ${sizeClass}
          shrink-0
          items-center
          justify-center
          bg-gradient-to-br
          from-blue-500
          to-violet-600
          text-white
          shadow-sm
        `}
      >
        <Building2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div
      className={`
        flex
        ${sizeClass}
        shrink-0
        items-center
        justify-center
        overflow-hidden
        font-bold
        ${
          active
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        }
      `}
    >
      {workspace.logoUrl ? (
        <Image
          src={workspace.logoUrl}
          alt={workspace.name}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : (
        workspace.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}