import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import QuickActions from '@/components/profile/QuickActions';

import ChangePasswordCard from '@/components/security/ChangePasswordCard';
import EmailVerificationCard from '@/components/security/EmailVerificationCard';
import ActiveSessionsCard from '@/components/security/ActiveSessionsCard';
import DangerZoneCard from '@/components/security/DangerZoneCard';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ProfileHeader />

      <div className="mx-auto max-w-6xl space-y-10 px-8 py-8">
        {/* ================= Profile ================= */}

        <section className="space-y-6">
          {/* <div>
            <h2 className="text-xl font-semibold">
              Profile
            </h2>

            <p className="text-sm text-muted-foreground">
              Manage your personal information.
            </p>
          </div> */}

          <ProfileCard />

          <div className="grid gap-6 lg:grid-cols-2">
            <PersonalInfoCard />

            <QuickActions />
          </div>
        </section>

        {/* ================= Security ================= */}

        <section className="space-y-6">
          {/* <div>
            <h2 className="text-xl font-semibold">
              Security
            </h2>

            <p className="text-sm text-muted-foreground">
              Protect your account.
            </p>
          </div> */}

          <ChangePasswordCard />

          <div className="grid gap-6 lg:grid-cols-2">
            <EmailVerificationCard />

            <ActiveSessionsCard />
          </div>
        </section>

        {/* ================= Danger ================= */}

        <section className="space-y-6">
          {/* <div>
            <h2 className="text-xl font-semibold text-red-500">
              Danger Zone
            </h2>

            <p className="text-sm text-muted-foreground">
              Permanent actions for your account.
            </p>
          </div> */}

          <DangerZoneCard />
        </section>
      </div>
    </div>
  );
}
