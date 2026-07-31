import Image from 'next/image';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WorkspaceDetail } from '@/types/workspace.type';
import PermissionGuard from '../common/PermissionGuard';
import { WORKSPACE_PERMISSION } from '@/constants/permissions';

export default function WorkspaceHeader({ workspace }: { workspace: WorkspaceDetail }) {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push(`/dashboard/w/${workspace.slug}/settings`);
  };

  return (
    <div
      className="
        h-56
        bg-gradient-to-r
        from-slate-700
        via-blue-600
        to-violet-600
        p-8
        text-white
        shadow-lg
      "
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Workspace information */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div
            className="
              flex
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-white/20
              bg-white/20
              text-3xl
              font-bold
              shadow-lg
              backdrop-blur-sm
            "
          >
            {workspace.logoUrl ? (
              <Image
                src={workspace.logoUrl}
                alt={workspace.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              workspace.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name & role */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>

              <span
                className="
                  rounded-full
                  border
                  border-white/20
                  bg-white/15
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  uppercase
                  backdrop-blur-sm
                "
              >
                {workspace.role.name}
              </span>
            </div>

            <p className="mt-2 text-sm text-white/75">Manage and monitor your workspace.</p>
          </div>
        </div>

        {/* Actions */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.WORKSPACE_UPDATE}>
          <button
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/20
              bg-white/10
              px-4
              py-2.5
              text-sm
              font-medium
              backdrop-blur-sm
              transition
              hover:bg-white/20
              cursor-pointer
            "
            onClick={() => {
              // Navigate to workspace settings page
              handleSettingsClick();
            }}
          >
            <Settings className="h-4 w-4" />
            Workspace settings
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
}
